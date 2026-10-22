"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, MoreHorizontal, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";




const columns = [
  { key: "checkbox", label: "" },
  { key: "id", label: "ID" },
  { key: "sku", label: "SKU" },
  { key: "name", label: "Product Name" },
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "type", label: "Type" },
  { key: "color", label: "Color" },
  { key: "regularPrice", label: "Regular Price" },
  { key: "salePrice", label: "Sale Price" },
  {
    key: "stock",
    label: "Stock Status",
    render: (row, { onToggleStock }) => (
      <div className="flex items-center gap-2">
        <Switch
          checked={row.stock > 0}
          onCheckedChange={(checked) => onToggleStock(row.id, checked ? 1 : 0)}
        />
        <span className="text-xs">
          {row.stock > 0 ? `In Stock (${row.stock})` : "Out of Stock"}
        </span>
      </div>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (row, { onView, onDelete }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(row.id)}>
            View / Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(row.id)}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [singleDeleteId, setSingleDeleteId] = useState(null);
  const [flag, setFlag] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [filters, setFilters] = useState({
    search: "",
    sort: "id",
    order: "desc",
  });

  /* --------------------------- FETCH DATA ------------------------------ */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products", {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          search: filters.search,
          sort: filters.sort,
          order: filters.order,
        },
      });

      setProducts(res.data.data || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      toast.error("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage, pagination.limit, filters, flag]);

  /* --------------------------- BASIC ACTIONS --------------------------- */
  const handleViewProduct = (id) => {
    router.push(`/admin/products/${id}`);
  };
  
  

  const handleDeleteProduct = async (id) => {
    setSingleDeleteId(id);
    setPendingAction("delete");
    setShowConfirmDialog(true);
  };

  const handleToggleStock = async (id, stockValue) => {
    try {
      await api.patch(`/products/${id}`, { stock: stockValue });
      toast.success("Stock updated");
      setFlag(!flag);
    } catch {
      toast.error("Failed to update stock");
    }
  };

  /* --------------------------- EXPORT ALL ------------------------------ */
  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const res = await api.get("/products", {
        params: { page: 1, limit: 1000000, sort: "id", order: "asc" },
      });
      const all = res.data.data || [];

      if (all.length === 0) {
        toast.error("No products to export");
        return;
      }

      const rows = all.map((p) => ({
        ID: p.id,
        SKU: p.sku || "",
        Name: p.name,
        Brand: p.brand?.name || "",
        Model: p.model?.name || "",
        Type: p.productType?.name || "",
        Color: p.color || "",
        Stock: p.stock,
        "Regular Price": p.regularPrice,
        "Sale Price": p.salePrice ?? "",
        "Weight (lb)": p.weightLb,
        "Length (in)": p.lengthIn,
        "Width (in)": p.widthIn,
        "Height (in)": p.heightIn,
        Description: p.description || "",
        "SEO Title": p.seoTitle || "",
        "SEO Description": p.seoDescription || "",
        "SEO Keywords": p.seoKeywords || "",
        Slug: p.slug || "",
        "Image 1": p.imageOne || "",
        "Image 1 Alt": p.imgAltOne || "",
        "Image 2": p.imageTwo || "",
        "Image 2 Alt": p.imgAltTwo || "",
        "Image 3": p.imageThree || "",
        "Image 3 Alt": p.imgAltThree || "",
        "Image 4": p.imageFour || "",
        "Image 4 Alt": p.imgAltFour || "",
        "Fishbowl Part Number": p.fishbowlPartNumber || "",
        "Created At": p.createdAt || "",
        "Updated At": p.updatedAt || "",
      }));

      const csv = Papa.unparse(rows);
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${rows.length} products`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export products");
    } finally {
      setIsExporting(false);
    }
  };

  /* --------------------------- SELECTION ------------------------------- */
  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? products.map((p) => p.id) : []);
  };

  const handleSelectRow = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("No products selected");
      return;
    }
    setPendingAction("delete");
    setSingleDeleteId(null);
    setShowConfirmDialog(true);
  };

  /* --------------------------- CONFIRM DIALOG -------------------------- */
  const confirmBulkAction = async () => {
    if (pendingAction !== "delete") return;

    setIsActionLoading(true);
    try {
      const idsToDelete = singleDeleteId ? [singleDeleteId] : selectedIds;

      await api.post("/bulk-delete-products", { ids: idsToDelete });

      toast.success(
        `${idsToDelete.length} product${idsToDelete.length > 1 ? "s" : ""} deleted successfully`
      );

      setSelectedIds([]);
      setSingleDeleteId(null);
      setFlag((prev) => !prev);
    } catch (error) {
      toast.error("Failed to delete products");
    } finally {
      setIsActionLoading(false);
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  /* -------------------------- PAGINATION / FILTER ---------------------- */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleLimitChange = (value) => {
    setPagination((prev) => ({
      ...prev,
      limit: Number(value),
      currentPage: 1,
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const getConfirmDialogDescription = () => {
    const count = singleDeleteId ? 1 : selectedIds.length;
    return `Are you sure you want to delete ${count} product${count > 1 ? "s" : ""}? This action cannot be undone.`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Products</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/admin/products/create")}>
            Add New Product
          </Button>
          {/* Optional: Keep bulk import if you have it */}
          <Button onClick={() => router.push("/admin/products/bulk-import")}>
            Bulk Import CSV
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/products/image-sync")}>
            Image Sync (Club Pro)
          </Button>
          <Button
            variant="outline"
            onClick={handleExportAll}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export All Products"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <Input
          placeholder="Search by name, brand, model..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />

        <Select value={filters.sort} onValueChange={(v) => handleFilterChange("sort", v)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="regularPrice">Regular Price</SelectItem>
            <SelectItem value="createdAt">Created Date</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.order} onValueChange={(v) => handleFilterChange("order", v)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={loading || isActionLoading}
          >
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedIds.length === products.length && products.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={loading}
                    />
                  </TableHead>
                  {columns.slice(1).map((col) => (
                    <TableHead key={col.key} className="whitespace-nowrap">
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg text-gray-600">No products found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{row.id}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-gray-700">{row.sku || "-"}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.brand?.name || "-"}</TableCell>
                      <TableCell>{row.model?.name || "-"}</TableCell>
                      <TableCell>{row.productType?.name || "-"}</TableCell>
                      <TableCell>{row.color || "-"}</TableCell>
                      <TableCell>${row.regularPrice}</TableCell>
                      <TableCell>
                        {row.salePrice !== null ? `$${row.salePrice}` : "-"}
                      </TableCell>
                      <TableCell>
                        {columns.find((c) => c.key === "stock").render(row, {
                          onToggleStock: handleToggleStock,
                        })}
                      </TableCell>
                      <TableCell>
                        {columns.find((c) => c.key === "actions").render(row, {
                          onView: handleViewProduct,
                          onDelete: handleDeleteProduct,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {products.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <div className="flex items-center space-x-2 text-sm">
                <p>
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1} -{" "}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{" "}
                  {pagination.totalItems} products
                </p>
                <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <p>per page</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>{getConfirmDialogDescription()}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkAction}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}