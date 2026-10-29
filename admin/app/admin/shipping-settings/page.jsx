"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Zap,
  Percent,
  DollarSign,
  Package,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ShippingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [carrierMode, setCarrierMode] = useState("FEDEX");
  const [markupPercent, setMarkupPercent] = useState(0);
  const [handlingFee, setHandlingFee] = useState(0);
  const [nyOrigin, setNyOrigin] = useState({
    name: "Club Pro MFG (NY Warehouse)",
    address: "10 Lucon Drive",
    city: "DEER PARK",
    state: "NY",
    zip: "11729",
    country: "US",
    priority: 1,
  });
  const [drOrigin, setDrOrigin] = useState({
    name: "Club Pro MFG (DR Warehouse)",
    address: "Parque Industrial Zona Franca",
    city: "Santiago",
    state: "Santiago",
    zip: "51000",
    country: "DO",
    priority: 2,
  });
  const [boxVariants, setBoxVariants] = useState([]);

  // Box Modal State
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [boxForm, setBoxForm] = useState({
    id: "",
    name: "",
    length: 12,
    width: 10,
    height: 6,
    maxWeight: 50,
    description: "",
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shipping/admin/settings");
      if (res.data?.success && res.data.settings) {
        const s = res.data.settings;
        setCarrierMode(s.carrierMode || "FEDEX");
        setMarkupPercent(s.markupPercent || 0);
        setHandlingFee(s.handlingFee || 0);
        if (s.nyOrigin) setNyOrigin(s.nyOrigin);
        if (s.drOrigin) setDrOrigin(s.drOrigin);
        if (Array.isArray(s.boxVariants)) setBoxVariants(s.boxVariants);
      }
    } catch (err) {
      console.error("Error fetching shipping settings:", err);
      toast.error("Failed to load shipping settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        carrierMode,
        markupPercent: parseFloat(markupPercent) || 0,
        handlingFee: parseFloat(handlingFee) || 0,
        nyOrigin,
        drOrigin,
        boxVariants,
      };

      const res = await api.put("/shipping/admin/settings", payload);
      if (res.data?.success) {
        toast.success("Shipping and logistics settings updated successfully.");
      } else {
        toast.error(res.data?.message || "Failed to update settings.");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddBox = () => {
    setBoxForm({
      id: `box-${Date.now()}`,
      name: "",
      length: 24,
      width: 16,
      height: 12,
      maxWeight: 50,
      description: "",
    });
    setIsBoxModalOpen(true);
  };

  const handleSaveBox = () => {
    if (!boxForm.name.trim()) {
      toast.error("Box variant name is required.");
      return;
    }

    setBoxVariants((prev) => {
      const exists = prev.some((b) => b.id === boxForm.id);
      if (exists) {
        return prev.map((b) => (b.id === boxForm.id ? { ...boxForm } : b));
      }
      return [...prev, { ...boxForm }];
    });

    setIsBoxModalOpen(false);
    toast.success(`Box variant "${boxForm.name}" added. Click "Save Changes" to persist.`);
  };

  const handleDeleteBox = (boxId) => {
    setBoxVariants((prev) => prev.filter((b) => b.id !== boxId));
    toast.info("Box removed. Click 'Save Changes' to persist.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Shipping & Logistics Management
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Live Engine Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure carrier rate shopping, dynamic markups, multi-origin fulfillment, and master box packaging variants.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 shrink-0">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {/* ── 1. Carrier Engine Selection ────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <CardTitle>Carrier Preference & Rate Engine</CardTitle>
          </div>
          <CardDescription>
            Choose which carrier calculates live shipping rates during checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* FedEx Option */}
            <div
              onClick={() => setCarrierMode("FEDEX")}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                carrierMode === "FEDEX"
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-foreground">FedEx Only</span>
                {carrierMode === "FEDEX" && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <Badge variant="secondary" className="mb-2 text-xs bg-purple-100 text-purple-800">
                Client SOP Preferred
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Quotes live negotiated contractual rates using account #740980114. 99.9% cheaper than standard commercial rates.
              </p>
            </div>

            {/* UPS Option */}
            <div
              onClick={() => setCarrierMode("UPS")}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                carrierMode === "UPS"
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-foreground">UPS Only</span>
                {carrierMode === "UPS" && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <Badge variant="secondary" className="mb-2 text-xs">
                Account #80E8E8
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Uses live UPS Ground & Air API with Deer Park NY shipper origin.
              </p>
            </div>

            {/* Cheapest / Best Rate Option */}
            <div
              onClick={() => setCarrierMode("CHEAPEST")}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                carrierMode === "CHEAPEST"
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-foreground flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                  Auto Best Rate
                </span>
                {carrierMode === "CHEAPEST" && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <Badge variant="secondary" className="mb-2 text-xs bg-amber-100 text-amber-800">
                Rate Shopping
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Queries both FedEx and UPS simultaneously in parallel and automatically selects whichever carrier offers the lowest rate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Dynamic Markup & Handling Fees ──────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            <CardTitle>Dynamic Markup & Additional Fees</CardTitle>
          </div>
          <CardDescription>
            Add a profit margin percentage and flat handling fees on top of negotiated carrier costs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Percent className="h-4 w-4 text-muted-foreground" />
                Shipping Markup (%)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Percentage added to the live carrier quote (e.g. enter <strong>10</strong> to add a 10% margin on top of negotiated rates).
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Flat Handling / Box Fee ($ USD)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.25"
                placeholder="0.00"
                value={handlingFee}
                onChange={(e) => setHandlingFee(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Fixed dollar amount added per order for packaging, materials, or warehouse handling (e.g. <strong>$5.00</strong>).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Multi-Location Fulfillment (NY Priority & DR) ─────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Multi-Location Warehouse Fulfillment</CardTitle>
          </div>
          <CardDescription>
            New York has Priority 1. Dominican Republic (DR-Stock) is Priority 2 for split/routed shipments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NY Origin */}
            <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Primary Origin: New York (NY)
                </span>
                <Badge className="bg-emerald-100 text-emerald-800">Priority 1</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Street Address</Label>
                  <Input
                    value={nyOrigin.address}
                    onChange={(e) => setNyOrigin({ ...nyOrigin, address: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">City</Label>
                  <Input
                    value={nyOrigin.city}
                    onChange={(e) => setNyOrigin({ ...nyOrigin, city: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">State</Label>
                  <Input
                    value={nyOrigin.state}
                    onChange={(e) => setNyOrigin({ ...nyOrigin, state: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Zip Code</Label>
                  <Input
                    value={nyOrigin.zip}
                    onChange={(e) => setNyOrigin({ ...nyOrigin, zip: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            {/* DR Origin */}
            <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Secondary Origin: Dominican Republic (DR)
                </span>
                <Badge className="bg-blue-100 text-blue-800">Priority 2 (DR-Stock)</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Street Address</Label>
                  <Input
                    value={drOrigin.address}
                    onChange={(e) => setDrOrigin({ ...drOrigin, address: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">City</Label>
                  <Input
                    value={drOrigin.city}
                    onChange={(e) => setDrOrigin({ ...drOrigin, city: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Country Code</Label>
                  <Input
                    value={drOrigin.country}
                    onChange={(e) => setDrOrigin({ ...drOrigin, country: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Postal Code</Label>
                  <Input
                    value={drOrigin.zip}
                    onChange={(e) => setDrOrigin({ ...drOrigin, zip: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Master Box Packaging & Variant Consolidation ─────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Master Box Packaging Variants & Consolidation</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Standard master box sizes and multi-item nesting rules (e.g. Enclosure + Sand Bottle in 1 box).
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleOpenAddBox} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Box Variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Smart Box Consolidation is Active:</strong> When a customer orders an Enclosure and an accessory (e.g. Sand Bottle, Cooler, Cleats), the system automatically nests the accessory into the enclosure&apos;s master box parcel instead of charging for 2 separate shipments.
            </span>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="py-2.5 px-3 text-left font-semibold">Box Name</th>
                  <th className="py-2.5 px-3 text-left font-semibold">Dimensions (L × W × H)</th>
                  <th className="py-2.5 px-3 text-left font-semibold">Max Weight</th>
                  <th className="py-2.5 px-3 text-left font-semibold">Description / Fits</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {boxVariants.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-medium text-foreground">{b.name}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {b.length}&quot; × {b.width}&quot; × {b.height}&quot;
                    </td>
                    <td className="py-2.5 px-3 font-mono">{b.maxWeight} lbs</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{b.description || "—"}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteBox(b.id)}
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Add Box Variant Modal ──────────────────────────────── */}
      <Dialog open={isBoxModalOpen} onOpenChange={setIsBoxModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Master Box Variant</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-3 text-xs">
            <div>
              <Label className="text-xs">Box Variant Name</Label>
              <Input
                placeholder="e.g. Master Box 48x12x12"
                value={boxForm.name}
                onChange={(e) => setBoxForm({ ...boxForm, name: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Length (in)</Label>
                <Input
                  type="number"
                  value={boxForm.length}
                  onChange={(e) => setBoxForm({ ...boxForm, length: parseFloat(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Width (in)</Label>
                <Input
                  type="number"
                  value={boxForm.width}
                  onChange={(e) => setBoxForm({ ...boxForm, width: parseFloat(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Height (in)</Label>
                <Input
                  type="number"
                  value={boxForm.height}
                  onChange={(e) => setBoxForm({ ...boxForm, height: parseFloat(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Max Weight Capacity (lbs)</Label>
              <Input
                type="number"
                value={boxForm.maxWeight}
                onChange={(e) => setBoxForm({ ...boxForm, maxWeight: parseFloat(e.target.value) || 0 })}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Description / Packing Rules</Label>
              <Input
                placeholder="e.g. Fits up to 4 Shark Fin boxes"
                value={boxForm.description}
                onChange={(e) => setBoxForm({ ...boxForm, description: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setIsBoxModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveBox}>
              Add Box
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

