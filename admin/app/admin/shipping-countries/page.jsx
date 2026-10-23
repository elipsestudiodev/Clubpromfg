"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Globe, Truck, CheckCircle2, XCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function ShippingCountriesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryToDelete, setCountryToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    carrier: "FedEx",
    isActive: true,
    sortOrder: 0,
  });

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shipping/admin/countries");
      if (res.data?.success) {
        setCountries(res.data.countries || []);
      }
    } catch (err) {
      console.error("Error fetching shipping countries:", err);
      toast.error("Failed to load shipping countries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const openAddModal = () => {
    setEditingCountry(null);
    setFormData({
      name: "",
      code: "",
      carrier: "FedEx",
      isActive: true,
      sortOrder: (countries.length + 1),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCountry(c);
    setFormData({
      name: c.name,
      code: c.code,
      carrier: c.carrier || "FedEx",
      isActive: Boolean(c.isActive),
      sortOrder: c.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Country name and code are required.");
      return;
    }

    setIsActionLoading(true);
    try {
      if (editingCountry) {
        const res = await api.put(`/shipping/admin/countries/${editingCountry.id}`, formData);
        if (res.data?.success) {
          toast.success("Country updated successfully.");
        }
      } else {
        const res = await api.post("/shipping/admin/countries", formData);
        if (res.data?.success) {
          toast.success("Country added successfully.");
        }
      }
      setIsModalOpen(false);
      fetchCountries();
    } catch (err) {
      console.error("Error saving country:", err);
      toast.error(err.response?.data?.message || "Failed to save country.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!countryToDelete) return;
    setIsActionLoading(true);
    try {
      const res = await api.delete(`/shipping/admin/countries/${countryToDelete.id}`);
      if (res.data?.success) {
        toast.success("Country deleted successfully.");
        setIsDeleteModalOpen(false);
        setCountryToDelete(null);
        fetchCountries();
      }
    } catch (err) {
      console.error("Error deleting country:", err);
      toast.error(err.response?.data?.message || "Failed to delete country.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleStatus = async (c) => {
    try {
      const res = await api.put(`/shipping/admin/countries/${c.id}`, {
        isActive: !c.isActive,
      });
      if (res.data?.success) {
        toast.success(`${c.name} is now ${!c.isActive ? 'Active' : 'Inactive'}.`);
        fetchCountries();
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-yellow-500" />
            Shipping Countries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage supported domestic (UPS) and international (FedEx) destinations for checkout.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Country
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : countries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No shipping countries configured.</p>
            <Button onClick={openAddModal} variant="outline" className="mt-4">
              Add First Country
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-16">Sort</TableHead>
                <TableHead>Country Name</TableHead>
                <TableHead>Code (ISO)</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((c) => (
                <TableRow key={c.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-mono text-xs text-gray-500">
                    {c.sortOrder || 0}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {c.name}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold text-gray-700">
                      {c.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.carrier === "UPS"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-purple-100 text-purple-800 border border-purple-200"
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {c.carrier || (c.code === "US" ? "UPS" : "FedEx")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleStatus(c)}
                      className="inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                    >
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(c)}
                      className="text-gray-600 hover:text-black"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCountryToDelete(c);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingCountry ? "Edit Shipping Country" : "Add Shipping Country"}
            </DialogTitle>
            <DialogDescription>
              Configure destination details for live rate calculation in checkout.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label htmlFor="countryName" className="text-xs uppercase font-bold text-gray-600">
                Country Name *
              </Label>
              <Input
                id="countryName"
                placeholder="e.g. Canada, Germany, Australia"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="countryCode" className="text-xs uppercase font-bold text-gray-600">
                  ISO Code (2-letter) *
                </Label>
                <Input
                  id="countryCode"
                  placeholder="e.g. CA, DE, GB"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  maxLength={5}
                  required
                  className="mt-1 uppercase font-mono"
                />
              </div>

              <div>
                <Label htmlFor="carrier" className="text-xs uppercase font-bold text-gray-600">
                  Carrier *
                </Label>
                <Select
                  value={formData.carrier}
                  onValueChange={(val) => setFormData({ ...formData, carrier: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="FedEx">FedEx (International)</SelectItem>
                    <SelectItem value="UPS">UPS (Domestic / Express)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <Label htmlFor="sortOrder" className="text-xs uppercase font-bold text-gray-600">
                  Sort Order
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-400"
                />
                <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Active in Checkout
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                disabled={isActionLoading}
              >
                {isActionLoading ? "Saving..." : editingCountry ? "Update Country" : "Add Country"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Delete Shipping Country</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong className="text-gray-900">{countryToDelete?.name} ({countryToDelete?.code})</strong>?
              Customers from this country will no longer be able to select it at checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isActionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isActionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
