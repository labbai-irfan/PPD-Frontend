import { useRef, useState } from 'react'
import { Upload, Download, AlertCircle, CheckCircle, FileText, Package, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/services/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface BulkImportResult {
  jobId: string
  status: 'success' | 'partial' | 'failed'
  timestamp: string
  summary: {
    totalProducts: number
    successCount: number
    failedCount: number
    totalImages: number
    matchedImages: number
  }
  products: Array<{
    title: string
    brand: string
    status: 'created' | 'updated' | 'failed' | 'skipped'
    images: number
    errors?: string[]
  }>
  warnings: string[]
}

export default function AdminBulkImportPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  // Download template from backend
  const downloadTemplate = async () => {
    try {
      const response = await apiClient.get('/admin/bulk-import/template', {
        responseType: 'blob',
      })
      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bulk-import-template.csv'
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Template downloaded')
    } catch (error) {
      toast.error('Failed to download template')
    }
  }

  // Get instructions
  const getInstructions = async () => {
    try {
      const { data } = await apiClient.get('/admin/bulk-import/instructions')
      console.log('Import Instructions:', data)
      toast.success('Check console for detailed instructions')
    } catch (error) {
      toast.error('Failed to load instructions')
    }
  }

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(selected.type) && !selected.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      setCsvFile(selected)
      setResult(null)
    }
  }

  const handleZipSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!['application/zip', 'application/x-zip-compressed'].includes(selected.type) && !selected.name.endsWith('.zip')) {
        toast.error('Please select a ZIP file')
        return
      }
      setZipFile(selected)
      setResult(null)
    }
  }

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>, type: 'csv' | 'zip') => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (type === 'csv') {
        if (!['text/csv', 'application/vnd.ms-excel'].includes(file.type) && !file.name.endsWith('.csv')) {
          toast.error('Please drag a CSV file')
          return
        }
        setCsvFile(file)
      } else {
        if (!['application/zip'].includes(file.type) && !file.name.endsWith('.zip')) {
          toast.error('Please drag a ZIP file')
          return
        }
        setZipFile(file)
      }
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!csvFile) {
      toast.error('CSV file is required')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', csvFile)
      if (zipFile) {
        formData.append('files', zipFile)
      }

      const { data } = await apiClient.post<BulkImportResult>('/admin/bulk-import/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(data)

      if (data.status === 'success') {
        toast.success(`✓ All ${data.summary.successCount} products imported successfully!`)
      } else if (data.status === 'partial') {
        toast.warning(
          `⚠ Partial success: ${data.summary.successCount} products imported, ${data.summary.failedCount} failed`,
        )
      } else {
        toast.error(`✗ All products failed to import`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bulk Product Import</h1>
        <p className="text-gray-600">Upload a CSV file with product data and optional ZIP file with images</p>
      </div>

      {/* Instructions Card */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-blue-900">How to use</p>
            <ul className="text-blue-800 space-y-1 ml-4 list-disc">
              <li>Download the template to see required columns</li>
              <li>Fill in your product data (title, brand, category, price, etc.)</li>
              <li>For images: Create a ZIP file with images named matching product titles</li>
              <li>Image naming: ProductName.jpg, ProductName_1.jpg, ProductName_2.jpg</li>
              <li>Upload both CSV and ZIP (ZIP is optional)</li>
              <li>Existing products (matched by title+brand) will be updated</li>
            </ul>
            <div className="flex gap-3 pt-3">
              <Button size="sm" variant="primary" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-1.5" />
                Download Template
              </Button>
              <Button size="sm" variant="secondary" onClick={getInstructions}>
                <FileText className="h-4 w-4 mr-1.5" />
                View Full Instructions
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Upload */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Product Data (CSV)</h3>
            <span className="text-red-600 text-lg">*</span>
          </div>

          {csvFile ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{csvFile.name}</p>
                  <p className="text-sm text-green-700">{(csvFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => {
                  setCsvFile(null)
                  if (csvInputRef.current) csvInputRef.current.value = ''
                }}
              >
                Change File
              </Button>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDragDrop(e, 'csv')}
              onClick={() => csvInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition"
            >
              <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Drag CSV file here</p>
              <p className="text-sm text-gray-500">or click to select (.csv, .xlsx, .xls)</p>
            </div>
          )}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.ms-excel"
            onChange={handleCsvSelect}
            className="hidden"
          />
        </Card>

        {/* ZIP Upload */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold">Product Images (ZIP)</h3>
            <span className="text-gray-400 text-sm">(optional)</span>
          </div>

          {zipFile ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">{zipFile.name}</p>
                  <p className="text-sm text-orange-700">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => {
                  setZipFile(null)
                  if (zipInputRef.current) zipInputRef.current.value = ''
                }}
              >
                Remove File
              </Button>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDragDrop(e, 'zip')}
              onClick={() => zipInputRef.current?.click()}
              className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center cursor-pointer hover:bg-orange-50 transition"
            >
              <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Drag ZIP file here</p>
              <p className="text-sm text-gray-500">or click to select (.zip)</p>
            </div>
          )}
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={handleZipSelect}
            className="hidden"
          />
        </Card>
      </div>

      {/* Upload Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleUpload}
          disabled={!csvFile || uploading}
          size="lg"
          className="px-8"
        >
          {uploading ? (
            <>
              <Zap className="h-5 w-5 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Start Import
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Card className={`p-6 border-2 ${result.status === 'success' ? 'border-green-200 bg-green-50' : result.status === 'partial' ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start gap-3 mb-4">
            {result.status === 'success' ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`font-bold text-lg ${result.status === 'success' ? 'text-green-900' : 'text-yellow-900'}`}>
                {result.status === 'success' ? '✓ Import Successful!' : '⚠ Import Complete with Issues'}
              </h3>
              <p className={`text-sm ${result.status === 'success' ? 'text-green-800' : 'text-yellow-800'}`}>
                Job ID: {result.jobId}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{result.summary.totalProducts}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">✓ Created/Updated</p>
              <p className="text-2xl font-bold text-green-600">{result.summary.successCount}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">✗ Failed</p>
              <p className="text-2xl font-bold text-red-600">{result.summary.failedCount}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">Images Matched</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.summary.matchedImages}/{result.summary.totalImages}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold">
                {result.summary.totalProducts > 0
                  ? Math.round((result.summary.successCount / result.summary.totalProducts) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="mb-4 bg-white border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-900 mb-2">⚠ Warnings:</p>
              <ul className="space-y-1">
                {result.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-yellow-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Failed Products */}
          {result.products.filter((p) => p.status === 'failed').length > 0 && (
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900 mb-3">Failed Products:</p>
              <div className="space-y-2">
                {result.products
                  .filter((p) => p.status === 'failed')
                  .map((product, i) => (
                    <div key={i} className="border-l-4 border-red-400 pl-3 py-1">
                      <p className="font-medium text-red-900">
                        {product.title} ({product.brand})
                      </p>
                      {product.errors?.map((error, j) => (
                        <p key={j} className="text-sm text-red-700">
                          • {error}
                        </p>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <Button
            className="mt-6 w-full"
            onClick={() => {
              setCsvFile(null)
              setZipFile(null)
              setResult(null)
              if (csvInputRef.current) csvInputRef.current.value = ''
              if (zipInputRef.current) zipInputRef.current.value = ''
            }}
          >
            Import Another Batch
          </Button>
        </Card>
      )}
    </div>
  )
}
