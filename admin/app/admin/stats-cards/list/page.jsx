"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {api} from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, MoreHorizontal } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function StatsCardsList() {
    const router = useRouter();

    const [cards, setCards] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [singleDeleteId, setSingleDeleteId] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

    const [search, setSearch] = useState("");

    /* ---------------- FETCH ---------------- */
    const fetchStatsCards = async () => {
        try {
            setLoading(true);
            const res = await api.get("/stats-cards/list", {
                params: { page, limit, search, sort: "createdAt", order: "desc" },
            });

            setCards(res.data.data || []);
            setMeta({
                total: res.data.pagination?.total ?? 0,
                totalPages: res.data.pagination?.totalPages ?? 1,
            });
        } catch {
            toast.error("Failed to fetch stats cards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatsCards();
    }, [page, limit, search, refresh]);

    /* ---------------- ACTIONS ---------------- */
    const handleView = (id) => {
        router.push(`/admin/stats-cards/${id}`);
    };

    const handleDelete = (id) => {
        setSingleDeleteId(id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setActionLoading(true);
            const ids = singleDeleteId ? [singleDeleteId] : selectedIds;

            await api.post("/stats-cards/bulk-delete", { ids });

            toast.success("Stats card(s) deleted");
            setSelectedIds([]);
            setSingleDeleteId(null);
            setRefresh((p) => !p);
        } catch {
            toast.error("Delete failed");
        } finally {
            setActionLoading(false);
            setConfirmOpen(false);
        }
    };

    /* ---------------- SELECTION ---------------- */
    const toggleAll = (checked) => {
        setSelectedIds(checked ? cards.map((c) => c.id) : []);
    };

    const toggleOne = (id, checked) => {
        setSelectedIds((prev) =>
            checked ? [...prev, id] : prev.filter((i) => i !== id)
        );
    };

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Stats Cards</h2>
                <Button onClick={() => router.push("/admin/stats-cards/create")}>
                    Add Stats Card
                </Button>
            </div>

            {/* Search */}
            <Input
                placeholder="Search by title or value..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
            />

            {/* Bulk Delete */}
            {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    Delete Selected ({selectedIds.length})
                </Button>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={
                                            selectedIds.length === cards.length && cards.length > 0
                                        }
                                        onCheckedChange={toggleAll}
                                    />
                                </TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {cards.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <AlertCircle className="mx-auto mb-2 text-gray-400" />
                                        No stats cards found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cards.map((card) => (
                                    <TableRow key={card.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(card.id)}
                                                onCheckedChange={(c) => toggleOne(card.id, c)}
                                            />
                                        </TableCell>
                                        <TableCell>{card.id}</TableCell>
                                        <TableCell>
                                            {card.imageUrl ? (
                                                <img
                                                    src={`https://api.clubpromfg.com${card.imageUrl}`}
                                                    alt={card.title}
                                                    className="w-10 h-10 object-contain rounded-full bg-amber-100 p-1"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg">✓</div>
                                            )}
                                        </TableCell>
                                        <TableCell>{card.title}</TableCell>
                                        <TableCell>{card.value}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleView(card.id)}>
                                                        View / Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(card.id)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6">
                        <p className="text-sm">
                            Page {page} of {meta.totalPages}
                        </p>
                        {(page > 1 || page < meta.totalPages) && (
                            <div className="flex gap-2">
                                {page > 1 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                )}
                                {page < meta.totalPages && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Confirm Delete */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
