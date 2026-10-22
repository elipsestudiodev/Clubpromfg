'use client';
import Papa from "papaparse";
import readXlsxFile from "read-excel-file/browser";
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft } from 'lucide-react';

export default function BulkImportPage() {
  const router = useRouter();
  const [headers, setHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importErrors, setImportErrors] = useState([]);
  const [sheets, setSheets] = useState([]); // [{ sheet, data }] when an .xlsx is uploaded
  const [selectedSheet, setSelectedSheet] = useState('');
  const [autoCreate, setAutoCreate] = useState(false);

  // Format numbers to whole numbers or decimals
  const formatNumber = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return value;
    // Only format purely numeric cells; "1776959031209-738439632.webp" must stay as-is
    if (!/^\s*-?\d+(\.\d+)?\s*$/.test(String(value))) return value;
    return parseFloat(value).toString();
  };

  // Master sheet column (normalized: lowercase, letters/digits only) -> API field.
  // Matches the columns produced by "Export All Products".
  const HEADER_MAP = {
    id: 'id',
    sku: 'sku',
    name: 'name', productname: 'name',
    brand: 'brand',
    model: 'model',
    type: 'type', producttype: 'type',
    color: 'color',
    stock: 'stock', qty: 'stock', quantity: 'stock',
    regularprice: 'regularPrice', price: 'regularPrice',
    saleprice: 'salePrice',
    weightlb: 'weightLb', weight: 'weightLb',
    lengthin: 'lengthIn', length: 'lengthIn',
    widthin: 'widthIn', width: 'widthIn',
    heightin: 'heightIn', height: 'heightIn',
    description: 'description',
    seotitle: 'seoTitle',
    seodescription: 'seoDescription',
    seokeywords: 'seoKeywords',
    slug: 'slug',
    image1: 'imageOne', imageone: 'imageOne',
    image1alt: 'imgAltOne', imgaltone: 'imgAltOne',
    image2: 'imageTwo', imagetwo: 'imageTwo',
    image2alt: 'imgAltTwo', imgalttwo: 'imgAltTwo',
    image3: 'imageThree', imagethree: 'imageThree',
    image3alt: 'imgAltThree', imgaltthree: 'imgAltThree',
    image4: 'imageFour', imagefour: 'imageFour',
    image4alt: 'imgAltFour', imgaltfour: 'imgAltFour',
    fishbowlpartnumber: 'fishbowlPartNumber', fishbowlpart: 'fishbowlPartNumber',
  };
  const normalizeHeader = (h) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const fieldFor = (header) => HEADER_MAP[normalizeHeader(header)];
  const nameHeader = (fields) => fields.find((h) => fieldFor(h) === 'name');

  const downloadSample = () => {
    const rows = [
      {
        ID: '', SKU: 'BC20R', Name: '3 x 4 Universal Enclosure', Brand: 'ClubPro', Model: '2 Passenger Universal',
        Type: 'Enclosure', Color: 'Red', Stock: 12, 'Regular Price': 215, 'Sale Price': 0,
        'Weight (lb)': 15, 'Length (in)': 28, 'Width (in)': 22, 'Height (in)': 3,
        Description: 'Fits all standard size golf cars', 'SEO Title': '', 'SEO Description': '', 'SEO Keywords': '', Slug: '',
        'Image 1': '3x4_universal_enclosure_red.jpg', 'Image 1 Alt': '', 'Image 2': '', 'Image 2 Alt': '',
        'Image 3': '', 'Image 3 Alt': '', 'Image 4': '', 'Image 4 Alt': '', 'Fishbowl Part Number': '',
      },
    ];
    const csvContent = Papa.unparse(rows);

    const blob = new Blob(["﻿" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sample_products.csv";
    link.click();

    URL.revokeObjectURL(url);
  };


  // Load a table (header list + row objects) into the preview. `firstLine` is the
  // spreadsheet line number of the first data row, used in error messages.
  const loadTable = (fields, rows, firstLine = 2) => {
    fields = fields.filter((h) => h && h !== "S no");
    const nameCol = nameHeader(fields);
    if (!nameCol) {
      toast.error('File must have a "Name" column');
      setHeaders([]);
      setCsvData([]);
      return;
    }
    const data = rows
      .map((row, i) => ({ ...row, __row: i + firstLine }))
      .filter((row) => String(row[nameCol] || '').trim());

    setImportErrors([]);
    setHeaders(fields);
    setCsvData(data);
  };

  const cellToString = (v) => {
    if (v === null || v === undefined) return '';
    if (v instanceof Date) return v.toISOString();
    return String(v);
  };

  const loadSheet = (sheet) => {
    const [headerRow = [], ...rest] = sheet.data;
    const fields = headerRow.map((h) => cellToString(h).trim());
    const rows = rest.map((r) => {
      const obj = {};
      fields.forEach((h, i) => { if (h) obj[h] = cellToString(r[i]); });
      return obj;
    });
    setSelectedSheet(sheet.sheet);
    loadTable(fields, rows);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (/\.xlsx$/i.test(file.name)) {
      try {
        const all = await readXlsxFile(file);
        // Only sheets whose first row has a "Name" column can be imported
        const usable = all.filter((s) =>
          nameHeader((s.data[0] || []).map((h) => cellToString(h)))
        );
        if (usable.length === 0) {
          toast.error('No sheet in this file has a "Name" column');
          return;
        }
        setSheets(usable);
        // Default to the sheet with the most rows (the master list)
        loadSheet(usable.reduce((a, b) => (b.data.length > a.data.length ? b : a)));
      } catch (err) {
        console.error("Excel Parse Error:", err);
        toast.error('Could not read the Excel file');
      }
      return;
    }

    setSheets([]);
    setSelectedSheet('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: "", // auto-detects comma or tab
      complete: (results) => loadTable(results.meta.fields || [], results.data),
      error: (err) => {
        console.error("CSV Parse Error:", err);
        toast.error('Could not read the CSV file');
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    disabled: isLoading,
  });

  const handleCellEdit = (rowIdx, header, value) => {
    setCsvData((prev) =>
      prev.map((row, i) => (i === rowIdx ? { ...row, [header]: value } : row))
    );
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleBulkUpload = async () => {
    // Send only columns present in the CSV so the backend doesn't blank out others
    const productsData = csvData.map((row) => {
      const product = { _row: row.__row };
      headers.forEach((header) => {
        const field = fieldFor(header);
        if (field) product[field] = row[header] ?? '';
      });
      return product;
    });

    if (productsData.length === 0) {
      toast.error('No valid products found in CSV');
      return;
    }

    setIsLoading(true);
    setImportErrors([]);
    try {
      const batchSize = 25;
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const errors = [];

      for (let i = 0; i < productsData.length; i += batchSize) {
        const batch = productsData.slice(i, i + batchSize);
        const response = await api.post('/products/import-csv', {
          products: batch,
          autoCreate,
        });

        createdCount += response.data.created || 0;
        updatedCount += response.data.updated || 0;
        skippedCount += response.data.skipped || 0;
        errors.push(...(response.data.errors || []));

        setProgress(Math.min(100, Math.round(((i + batchSize) / productsData.length) * 100)));
      }

      const summary = `${createdCount} created, ${updatedCount} updated, ${skippedCount} failed`;
      if (errors.length > 0) {
        setImportErrors(errors);
        toast.warning(`Import finished with errors: ${summary}`);
      } else {
        toast.success(`Products imported successfully: ${summary}`);
        router.push('/admin/products/list');
      }
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to import products'
      );
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products/list');
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Bulk Import CSV / Excel</h1>
          <Button onClick={downloadSample} variant="outline" size="sm">
            Download Sample CSV
          </Button>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm sm:text-base text-gray-600">
          {isDragActive
            ? 'Drop the CSV file here...'
            : 'Drag & drop a CSV or Excel (.xlsx) file here, or click to select'}
        </p>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {sheets.length > 0 && (
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium">Sheet:</span>
            <select
              value={selectedSheet}
              onChange={(e) => loadSheet(sheets.find((s) => s.sheet === e.target.value))}
              disabled={isLoading}
              className="border rounded-md px-2 py-1 text-sm"
            >
              {sheets.map((s) => (
                <option key={s.sheet} value={s.sheet}>
                  {s.sheet} ({Math.max(0, s.data.length - 1)} rows)
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoCreate}
            onChange={(e) => setAutoCreate(e.target.checked)}
            disabled={isLoading}
          />
          Auto-create missing Brand / Model / Type
        </label>
      </div>

      {csvData.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Preview ({csvData.length} products)</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              {isLoading && (
                <div className="flex items-center gap-2 text-sm">
                  Progress: {progress}%
                </div>
              )}
              <Button
                onClick={handleEditToggle}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </div>
          </div>

          {importErrors.length > 0 && (
            <div className="mb-4 border border-red-300 bg-red-50 rounded-lg p-4 max-h-72 overflow-y-auto">
              <p className="font-semibold text-red-700 mb-2">
                {importErrors.length} row(s) were not imported:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                {importErrors.map((e, idx) => (
                  <li key={idx}>
                    Row {e.row}{e.name ? ` (${e.name})` : ''}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, idx) => (
                    <TableHead key={idx} className="whitespace-nowrap">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {headers.map((header, colIdx) => (
                      <TableCell key={colIdx}>
                        {isEditing ? (
                          <Input
                            value={row[header] || ''}
                            onChange={(e) =>
                              handleCellEdit(rowIdx, header, e.target.value)
                            }
                            className="w-full min-w-[150px] sm:min-w-[200px] border-none focus:ring-0 bg-transparent text-xs sm:text-sm"
                            disabled={isLoading}
                          />
                        ) : (
                          <span className="text-xs sm:text-sm">
                            {formatNumber(row[header]) || ''}
                          </span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpload}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? `Uploading... ${progress}%` : 'Upload'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}