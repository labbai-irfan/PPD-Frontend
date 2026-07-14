import { useRef, useState } from 'react'
import { Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/services/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

export default function AdminBulkImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const headers = [
      'title',
      'brand',
      'category',
      'price',
      'mrp',
      'stock',
      'description',
      'images',
      'tags',
      'highlights',
      'deliveryDays',
      'returnDays',
    ]
    const exampleRow = [
      'Steel Sipper Water Bottle 750ml',
      'Brand Co',
      'Water Bottles',
      '299',
      '499',
      '50',
      'Premium stainless steel water bottle with insulation',
      'http://example.com/image1.jpg,http://example.com/image2.jpg',
      'featured,bestseller',
      'Keeps drinks cold for 24 hours;Double-walled design;Eco-friendly',
      '3',
      '30',
    ]

    // Create CSV data instead of Excel for simplicity
    const csvContent = [
      headers.join(','),
      exampleRow.map((v) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v)).join(','),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(selected.type)) {
        toast.error('Please select an Excel (.xlsx, .xls) or CSV file')
        return
      }
      setFile(selected)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await apiClient.post<ImportResult>('/admin/bulk-import/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      if (data.failed === 0) {
        toast.success(`✓ Imported ${data.success} products successfully`)
      } else {
        toast.error(`Imported ${data.success}, failed ${data.failed}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Product Import</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload an Excel file to import or update multiple products at once</p>
      </div>

      {/* Instructions */}
      <Card className="p-3 md:p-4 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
          <FileText className="size-4 text-primary" />
          How to use
        </h3>
        <ul className="mt-3 space-y-1 text-xs md:text-sm text-muted-foreground">
          <li>• Download the template below to see the required columns</li>
          <li>• Fill in your product data (title, brand, category, price, etc.)</li>
          <li>• For images: comma-separated URLs (e.g., url1.jpg,url2.jpg)</li>
          <li>• For tags: comma-separated values (e.g., featured,bestseller)</li>
          <li>• For highlights: semicolon-separated text (e.g., Feature 1;Feature 2)</li>
          <li>• Upload the file — existing products (matched by title+brand) will be updated</li>
          <li>• New products will be created automatically</li>
        </ul>
      </Card>

      {/* Download Template */}
      <Card className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground text-sm md:text-base">Template</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Download a CSV template to get started</p>
          </div>
          <Button onClick={downloadTemplate} variant="outline" className="gap-2 w-full sm:w-auto">
            <Download className="size-4" />
            Download Template
          </Button>
        </div>
      </Card>

      {/* Upload Area */}
      <Card className="p-3 md:p-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('bg-primary/5', 'border-primary')
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('bg-primary/5', 'border-primary')
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('bg-primary/5', 'border-primary')
            const dropped = e.dataTransfer.files?.[0]
            if (dropped) {
              setFile(dropped)
              setResult(null)
            }
          }}
          className="border-2 border-dashed border-border rounded-lg p-4 md:p-8 text-center cursor-pointer transition-colors hover:bg-primary/3"
        >
          <Upload className="size-8 md:size-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-semibold text-foreground text-sm md:text-base">Drag and drop your Excel file here</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">or click to select (.xlsx, .xls, .csv)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {/* Selected File */}
      {file && (
        <Card className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground text-sm md:text-base truncate">{file.name}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="gap-2 w-full sm:w-auto">
              {uploading ? 'Uploading…' : 'Upload & Import'}
            </Button>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className={`p-3 md:p-4 ${result.failed === 0 ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="shrink-0">
              {result.failed === 0 ? (
                <CheckCircle className="size-5 text-success" />
              ) : (
                <AlertCircle className="size-5 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm md:text-base">
                {result.failed === 0 ? '✓ Import completed' : '⚠ Import completed with errors'}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {result.success} successful • {result.failed} failed
              </p>
              {result.errors.length > 0 && (
                <div className="mt-3 bg-background rounded p-2 md:p-3 text-xs md:text-sm space-y-1 max-h-64 overflow-y-auto">
                  {result.errors.slice(0, 20).map((e, i) => (
                    <p key={i} className="text-destructive truncate">
                      Row {e.row}: {e.error}
                    </p>
                  ))}
                  {result.errors.length > 20 && <p className="text-muted-foreground">… and {result.errors.length - 20} more errors</p>}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
