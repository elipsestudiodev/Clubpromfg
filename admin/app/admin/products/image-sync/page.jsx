'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { baseUrl } from '@/lib/const';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';

// Pull product images from the Club Pro store instead of uploading them one by
// one. Each product is auto-paired with a Club Pro product (SKU first, then
// Fishbowl #, then name + brand + model + color); the admin can untick any
// row, pick a different Club Pro product, or opt in to replacing existing images.

const BATCH_SIZE = 5;
const REASON_LABEL = {
  sku: 'SKU match',
  fishbowl: 'Fishbowl # match',
  full: 'Name + brand + model + color',
  nameBrandModel: 'Name + brand + model',
  name: 'Name match',
  manual: 'Chosen by you',
};
const FILTERS = [
  ['all', 'All'],
  ['needs', 'Needs images'],
  ['has', 'Already has images'],
  ['none', 'No match'],
];

const text = (p) => [p.name, ...(p.altNames || []), p.sku, p.fishbowl, p.brand, p.model, p.color].join(' ').toLowerCase();
const imageSrc = (url) => (/^https?:\/\//i.test(url) ? url : `${baseUrl}${url}`);
const errorMessage = (err) => err?.response?.data?.message || err?.message || 'Request failed';

function Thumbs({ images, empty = 'No images' }) {
  if (!images?.length) return <span className="text-xs text-muted-foreground">{empty}</span>;
  return (
    <div className="flex items-center gap-1">
      {images.slice(0, 4).map((img) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={img.url} src={imageSrc(img.url)} alt={img.alt || ''} loading="lazy" className="h-10 w-10 rounded-md border object-cover bg-muted" />
      ))}
      {images.length > 4 && <span className="text-xs text-muted-foreground">+{images.length - 4}</span>}
    </div>
  );
}

function ProductLine({ p }) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-medium">{p.name}</div>
      <div className="text-xs text-muted-foreground">
        {[p.sku && `SKU: ${p.sku}`, p.brand, p.model, p.color].filter(Boolean).join(' · ')}
      </div>
    </div>
  );
}

function Picker({ product, remote, currentId, onPick, onClose }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return remote.filter((r) => words.every((w) => text(r).includes(w))).slice(0, 100);
  }, [q, remote]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Club Pro product</DialogTitle>
          <DialogDescription>Images will be pulled into: {product.name}{product.sku ? ` (${product.sku})` : ''}</DialogDescription>
        </DialogHeader>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Club Pro products by name, SKU, brand, model, color..." />
        <div className="overflow-y-auto -mx-2 px-2 flex-1">
          {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No Club Pro products found</p>}
          {list.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={!r.images.length}
              onClick={() => onPick(r.id)}
              className={`flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 ${r.id === currentId ? 'bg-accent' : ''}`}
            >
              <div className="w-44 shrink-0"><Thumbs images={r.images} /></div>
              <ProductLine p={r} />
              {r.id === currentId && <Badge className="ml-auto">Current</Badge>}
            </button>
          ))}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onPick(null)}>Don&apos;t pull for this product</Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ImageSyncPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [choice, setChoice] = useState({}); // productId -> { remoteId, reason } | null
  const [selected, setSelected] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [picking, setPicking] = useState(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState({}); // productId -> { ok, error }

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const { data: d } = await api.get('/catalog-sync/preview');
      const remoteById = new Map(d.remote.map((r) => [r.id, r]));
      const initial = {};
      const sel = new Set();
      for (const p of d.local) {
        initial[p.id] = p.match;
        if (p.match && remoteById.get(p.match.remoteId)?.images.length && p.images.length === 0) sel.add(p.id);
      }
      setData(d);
      setChoice(initial);
      setSelected(sel);
      setResults({});
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const remoteById = useMemo(() => new Map((data?.remote || []).map((r) => [r.id, r])), [data]);
  const sourceOf = (id) => (choice[id] ? remoteById.get(choice[id].remoteId) : null);
  const canPull = (id) => Boolean(sourceOf(id)?.images.length);

  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const rows = (data?.local || []).filter((p) => {
    if (words.length && !words.every((w) => text(p).includes(w))) return false;
    if (filter === 'needs') return p.images.length === 0 && canPull(p.id);
    if (filter === 'has') return p.images.length > 0;
    if (filter === 'none') return !canPull(p.id);
    return true;
  });

  const counts = { all: 0, needs: 0, has: 0, none: 0 };
  for (const p of data?.local || []) {
    counts.all++;
    if (p.images.length === 0 && canPull(p.id)) counts.needs++;
    if (p.images.length > 0) counts.has++;
    if (!canPull(p.id)) counts.none++;
  }

  const selectedList = (data?.local || []).filter((p) => selected.has(p.id) && canPull(p.id));
  const replacing = selectedList.filter((p) => p.images.length > 0);
  const visiblePullable = rows.filter((p) => canPull(p.id));
  const allVisibleSelected = visiblePullable.length > 0 && visiblePullable.every((p) => selected.has(p.id));

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      visiblePullable.forEach((p) => (allVisibleSelected ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  }

  function pick(remoteId) {
    const id = picking;
    setChoice((prev) => ({ ...prev, [id]: remoteId ? { remoteId, reason: 'manual' } : null }));
    setSelected((prev) => {
      const next = new Set(prev);
      if (remoteId) next.add(id);
      else next.delete(id);
      return next;
    });
    setPicking(null);
  }

  function startPull() {
    if (running || selectedList.length === 0) return;
    if (replacing.length > 0) setConfirmReplace(true);
    else run();
  }

  async function run() {
    setConfirmReplace(false);
    setRunning(true);
    const items = selectedList.map((p) => ({ productId: Number(p.id), remoteId: choice[p.id].remoteId }));
    setProgress({ done: 0, total: items.length });
    const outcome = {};
    const newImages = {};
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      try {
        const { data: res } = await api.post('/catalog-sync/apply', { items: batch });
        for (const r of res.results) {
          outcome[String(r.productId)] = { ok: r.ok, error: r.error };
          if (r.ok) newImages[String(r.productId)] = r.images;
        }
      } catch (err) {
        batch.forEach((b) => (outcome[String(b.productId)] = { ok: false, error: errorMessage(err) }));
      }
      setProgress({ done: Math.min(i + BATCH_SIZE, items.length), total: items.length });
      setResults((prev) => ({ ...prev, ...outcome }));
    }
    setData((prev) => ({ ...prev, local: prev.local.map((p) => (newImages[p.id] ? { ...p, images: newImages[p.id] } : p)) }));
    setSelected((prev) => new Set([...prev].filter((id) => !outcome[id]?.ok)));
    const ok = Object.values(outcome).filter((o) => o.ok).length;
    const failed = items.length - ok;
    if (ok) toast.success(`Images pulled for ${ok} product${ok === 1 ? '' : 's'}.`);
    if (failed) toast.error(`${failed} product${failed === 1 ? '' : 's'} failed — see the red rows. Nothing was changed on those.`);
    setRunning(false);
  }

  const product = picking && data?.local.find((p) => p.id === picking);

  return (
    <div className="space-y-4 sm:space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Image Sync</h2>
          <p className="text-sm text-muted-foreground">Pull product images from Club Pro{data?.source ? ` (${data.source})` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/products/list')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Product List
          </Button>
          <Button variant="outline" onClick={load} disabled={loading || running}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {loadError && <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{loadError}</div>}
      {loading && !data && <LoadingSpinner />}

      {data && (
        <>
          <p className="text-sm text-muted-foreground">
            Products are matched by SKU first, then Fishbowl #, then name + brand + model + color. Products with no images are ticked automatically.
            Products that <strong className="text-foreground">already have images are left alone</strong> unless you tick them — their images are then replaced.
            Use <strong className="text-foreground">Change</strong> to pull from any other Club Pro product. Up to 4 images are pulled per product.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1">
              {FILTERS.map(([key, label]) => (
                <Button key={key} size="sm" variant={filter === key ? 'default' : 'outline'} onClick={() => setFilter(key)}>
                  {label} <span className="ml-1 opacity-70">{counts[key]}</span>
                </Button>
              ))}
            </div>
            <Input className="sm:max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, SKU, brand..." />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={toggleAllVisible} disabled={running || !visiblePullable.length}>
              {allVisibleSelected ? 'Untick all shown' : `Tick all ${visiblePullable.length} shown`}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedList.length} selected
              {replacing.length > 0 && <span className="text-amber-600"> · {replacing.length} will replace existing images</span>}
            </span>
            <Button className="sm:ml-auto" onClick={startPull} disabled={running || selectedList.length === 0}>
              {running ? `Pulling... ${progress.done}/${progress.total}` : `Pull images for ${selectedList.length} product${selectedList.length === 1 ? '' : 's'}`}
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox aria-label="Tick all shown" checked={allVisibleSelected} onCheckedChange={toggleAllVisible} disabled={running || !visiblePullable.length} />
                  </TableHead>
                  <TableHead>MFG product</TableHead>
                  <TableHead>Current images</TableHead>
                  <TableHead>Pull from Club Pro product</TableHead>
                  <TableHead>Club Pro images</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => {
                  const src = sourceOf(p.id);
                  const reason = choice[p.id]?.reason;
                  const result = results[p.id];
                  return (
                    <TableRow key={p.id} className={result && !result.ok ? 'bg-destructive/10' : selected.has(p.id) ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Pull images for ${p.name}`}
                          checked={selected.has(p.id) && canPull(p.id)}
                          disabled={running || !canPull(p.id)}
                          onCheckedChange={() => toggle(p.id)}
                        />
                      </TableCell>
                      <TableCell className="max-w-64 whitespace-normal">
                        <ProductLine p={p} />
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.type && <Badge variant="outline">{p.type}</Badge>}
                          {result?.ok && <Badge className="bg-green-600 text-white">Pulled</Badge>}
                        </div>
                        {result && !result.ok && <div className="mt-1 text-xs text-destructive">{result.error}</div>}
                      </TableCell>
                      <TableCell><Thumbs images={p.images} /></TableCell>
                      <TableCell className="max-w-72 whitespace-normal">
                        {src ? (
                          <>
                            <ProductLine p={src} />
                            <Badge variant={reason === 'sku' || reason === 'fishbowl' ? 'default' : 'secondary'} className="mt-1">{REASON_LABEL[reason]}</Badge>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No match found</span>
                        )}
                        <div className="mt-2">
                          <Button size="sm" variant="outline" disabled={running} onClick={() => setPicking(p.id)}>
                            {src ? 'Change' : 'Choose Club Pro product'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell><Thumbs images={src?.images} empty={src ? 'Club Pro product has no images' : '—'} /></TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No products here — try another filter or search</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {product && (
        <Picker product={product} remote={data.remote} currentId={choice[picking]?.remoteId} onPick={pick} onClose={() => setPicking(null)} />
      )}

      <Dialog open={confirmReplace} onOpenChange={setConfirmReplace}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace existing images?</DialogTitle>
            <DialogDescription>
              {replacing.length} selected product{replacing.length === 1 ? ' already has' : 's already have'} images. Their current images will be replaced by the Club Pro images.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc pl-5 text-sm text-muted-foreground max-h-48 overflow-y-auto">
            {replacing.slice(0, 20).map((p) => <li key={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ''}</li>)}
            {replacing.length > 20 && <li>...and {replacing.length - 20} more</li>}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReplace(false)}>Cancel</Button>
            <Button onClick={run}>Yes, replace and pull</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
