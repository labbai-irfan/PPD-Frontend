import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Package,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/services/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'

interface InstructionsData {
  overview: string
  csv_format: {
    required_columns: string[]
    optional_columns: string[]
    data_types: Record<string, string>
  }
  images_format: {
    format: string
    naming_convention: string[]
    supported_formats: string[]
    max_file_size: string
    important_notes: string[]
  }
  workflow: string[]
  example_structure: {
    csv_row: string
    zip_contents: string[]
  }
}

interface BulkImportResult {
  jobId: string
  status: 'success' | 'partial' | 'failed'
  timestamp: string
  timeTakenMs?: number
  summary: {
    totalProducts: number
    successCount: number
    failedCount: number
    skippedCount: number
    totalImages: number
    matchedImages: number
    invalidCount?: number
  }
  products: Array<{
    title: string
    brand: string
    status: 'created' | 'updated' | 'failed' | 'skipped'
    images: number
    errors?: string[]
    warnings?: string[]
  }>
  warnings: string[]
}

const ALLOWED_WEIGHT_UNITS = ['kg', 'g', 'mg', 'ml', 'l', 'pcs', 'pack', 'box', 'set']

export default function AdminBulkImportPage() {
  const navigate = useNavigate()
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  // Options
  const [autoCreateBrands, setAutoCreateBrands] = useState(true)
  const [autoCreateTags, setAutoCreateTags] = useState(true)

  // Pre-validation state
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<BulkImportResult | null>(null)
  const [showIssuesList, setShowIssuesList] = useState(true)

  // Instructions modal
  const [instructions, setInstructions] = useState<InstructionsData | null>(null)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [instructionTab, setInstructionTab] = useState<'flow' | 'fields' | 'errors'>('flow')

  // Run pre-validation whenever files or options change
  useEffect(() => {
    const runValidation = async () => {
      if (!csvFile) {
        setValidationResult(null)
        return
      }

      setValidating(true)
      try {
        const formData = new FormData()
        formData.append('files', csvFile)
        if (zipFile) {
          formData.append('files', zipFile)
        }
        formData.append('autoCreateBrands', autoCreateBrands ? 'true' : 'false')
        formData.append('autoCreateTags', autoCreateTags ? 'true' : 'false')
        formData.append('dryRun', 'true')

        const { data } = await apiClient.post<BulkImportResult>(
          '/admin/bulk-import/import?dryRun=true',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        )
        setValidationResult(data)
      } catch (err) {
        toast.error('Pre-validation check failed')
        setValidationResult(null)
      } finally {
        setValidating(false)
      }
    }

    runValidation()
  }, [csvFile, zipFile, autoCreateBrands, autoCreateTags])

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
      toast.success('Template downloaded successfully')
    } catch (error) {
      toast.error('Failed to download template')
    }
  }

  // Get instructions
  const getInstructions = async () => {
    try {
      const response = await apiClient.get<InstructionsData>('/admin/bulk-import/instructions')
      setInstructions(response.data)
      setShowInstructionsModal(true)
    } catch (error) {
      toast.error('Failed to load instructions')
    }
  }

  // Download instructions as a text document
  const downloadInstructionsTxt = () => {
    if (!instructions) return

    let text = `BULK PRODUCT IMPORT INSTRUCTIONS\n`
    text += `================================\n\n`
    text += `OVERVIEW:\n${instructions.overview}\n\n`

    text += `WORKFLOW:\n`
    instructions.workflow.forEach((step, i) => {
      text += `${i + 1}. ${step}\n`
    })
    text += `\n`

    text += `CSV FORMAT:\n`
    text += `Required Columns: ${instructions.csv_format.required_columns.join(', ')}\n`
    text += `Optional Columns: ${instructions.csv_format.optional_columns.join(', ')}\n\n`
    text += `Data Types & Normalization Rules:\n`
    Object.entries(instructions.csv_format.data_types).forEach(([col, desc]) => {
      text += `  - ${col}: ${desc}\n`
    })
    text += `\n`

    text += `ACCEPTED WEIGHT UNITS:\n`
    text += `kg, g, mg, ml, l, pcs, pack, box, set (e.g. KG/Kg/kG will automatically match kg)\n\n`

    text += `ACCEPTED BOOLEAN VALUES:\n`
    text += `true, false, yes, no, 1, 0 (e.g. YES/Yes will automatically map to true)\n\n`

    text += `CLEANING OF NUMERICS:\n`
    text += `Currency symbols like ₹ and trailing text like Rs are automatically stripped (e.g. ₹500 -> 500).\n\n`

    text += `IMAGES FORMAT:\n`
    text += `Format: ${instructions.images_format.format}\n`
    text += `Max File Size: ${instructions.images_format.max_file_size}\n`
    text += `Supported Formats: ${instructions.images_format.supported_formats.join(', ')}\n\n`
    text += `Naming Conventions:\n`
    instructions.images_format.naming_convention.forEach((nc) => {
      text += `  - ${nc}\n`
    })
    text += `\nImportant Notes:\n`
    instructions.images_format.important_notes.forEach((note) => {
      text += `  - ${note}\n`
    })
    text += `\n`

    text += `EXAMPLE STRUCTURE:\n`
    text += `CSV Row Example:\n${instructions.example_structure.csv_row}\n\n`
    text += `ZIP Contents Example:\n`
    instructions.example_structure.zip_contents.forEach((item) => {
      text += `  - ${item}\n`
    })

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-import-instructions.txt'
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Instructions document downloaded')
  }

  // Download detailed import report
  const downloadReport = () => {
    if (!result) return
    let text = `BULK PRODUCT IMPORT REPORT\n`
    text += `==========================\n\n`
    text += `Job ID: ${result.jobId}\n`
    text += `Status: ${result.status.toUpperCase()}\n`
    text += `Timestamp: ${new Date(result.timestamp).toLocaleString()}\n`
    text += `Time Taken: ${result.timeTakenMs ? `${(result.timeTakenMs / 1000).toFixed(2)} seconds` : 'N/A'}\n\n`

    text += `SUMMARY:\n`
    text += `- Total Products: ${result.summary.totalProducts}\n`
    text += `- Imported Successfully: ${result.summary.successCount}\n`
    text += `- Skipped: ${result.summary.skippedCount}\n`
    text += `- Failed: ${result.summary.failedCount}\n`
    text += `- Images Matched: ${result.summary.matchedImages}/${result.summary.totalImages}\n\n`

    text += `PRODUCTS DETAILS:\n`
    result.products.forEach((p, idx) => {
      text += `Row ${idx + 2}: ${p.title} (${p.brand}) -> Status: ${p.status.toUpperCase()}\n`
      if (p.errors && p.errors.length > 0) {
        text += `  - Errors:\n`
        p.errors.forEach((err) => (text += `    • ${err}\n`))
      }
      if (p.warnings && p.warnings.length > 0) {
        text += `  - Warnings:\n`
        p.warnings.forEach((warn) => (text += `    • ${warn}\n`))
      }
    })

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `import-report-${result.jobId}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (
        !['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(
          selected.type
        ) &&
        !selected.name.endsWith('.csv')
      ) {
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
        if (
          !['text/csv', 'application/vnd.ms-excel'].includes(file.type) &&
          !file.name.endsWith('.csv')
        ) {
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
      formData.append('autoCreateBrands', autoCreateBrands ? 'true' : 'false')
      formData.append('autoCreateTags', autoCreateTags ? 'true' : 'false')

      const { data } = await apiClient.post<BulkImportResult>('/admin/bulk-import/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(data)

      if (data.status === 'success') {
        toast.success(`✓ All ${data.summary.successCount} products imported successfully!`)
      } else if (data.status === 'partial') {
        toast.warning(
          `⚠ Partial success: ${data.summary.successCount} products imported, ${data.summary.failedCount} failed`
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

  // Count errors & warnings in validationResult
  const totalErrors = validationResult?.products.reduce((acc, p) => acc + (p.errors?.length || 0), 0) || 0
  const totalWarnings =
    (validationResult?.products.reduce((acc, p) => acc + (p.warnings?.length || 0), 0) || 0) +
    (validationResult?.warnings.length || 0)
  const invalidRowsCount = validationResult?.summary.invalidCount || 0
  const validRowsCount = (validationResult?.summary.totalProducts || 0) - invalidRowsCount

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-xs">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bulk Product Import</h1>
          <p className="text-gray-500 mt-1">Upload CSV spreadsheet and optional ZIP folders with matching product images.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
          <Button variant="outline" className="h-11 px-4 cursor-pointer w-full sm:w-auto justify-center" onClick={getInstructions}>
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            View Instructions
          </Button>
          <Button variant="primary" className="h-11 px-4 cursor-pointer w-full sm:w-auto justify-center" onClick={downloadTemplate}>
            <Download className="h-5 w-5 mr-2" />
            Download Sample CSV
          </Button>
        </div>
      </div>

      {/* Top Row: Settings, CSV Upload, ZIP Upload */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Column 1: Import Settings */}
        <Card className="p-5 border border-gray-200 bg-white flex flex-col justify-between h-full rounded-2xl">
          <div>
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4">Import Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-gray-150 rounded-xl hover:bg-slate-50 transition cursor-pointer select-none">
                <div className="pr-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-gray-900 leading-tight">Auto-create Brands</p>
                    <div className="group relative flex items-center">
                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-950 text-white text-3xs font-medium rounded-lg p-2.5 shadow-xl w-56 z-50 leading-relaxed pointer-events-none normal-case tracking-normal">
                        If checked, new brand records will be automatically created using only the name from your spreadsheet (you can upload logos manually later). If unchecked, products with unknown brands will fail to import.
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-950"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">Add new brands automatically.</p>
                </div>
                <div className="relative inline-flex items-center flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={autoCreateBrands}
                    onChange={(e) => {
                      setAutoCreateBrands(e.target.checked)
                      setResult(null)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-gray-150 rounded-xl hover:bg-slate-50 transition cursor-pointer select-none">
                <div className="pr-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-gray-900 leading-tight">Auto-clean Tags</p>
                    <div className="group relative flex items-center">
                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-950 text-white text-3xs font-medium rounded-lg p-2.5 shadow-xl w-56 z-50 leading-relaxed pointer-events-none normal-case tracking-normal">
                        If checked, tags that are not pre-registered in the system will be silently ignored. If unchecked, the product upload will fail when unregistered tags are used.
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-950"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">Ignore unrecognized keywords.</p>
                </div>
                <div className="relative inline-flex items-center flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={autoCreateTags}
                    onChange={(e) => {
                      setAutoCreateTags(e.target.checked)
                      setResult(null)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* Column 2: Product Data Spreadsheet (CSV) */}
        <Card className={`p-5 border-2 transition h-full flex flex-col justify-between rounded-2xl ${csvFile ? 'border-emerald-300 bg-emerald-50/10' : 'border-dashed border-gray-300 hover:border-orange-400 bg-white'}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className={`h-5 w-5 ${csvFile ? 'text-emerald-600' : 'text-orange-500'}`} />
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Product Spreadsheet</h3>
              </div>
              <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">Required</span>
            </div>

            {csvFile ? (
              <div className="space-y-4">
                <div className="bg-white border border-emerald-100 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-emerald-950 truncate text-xs">{csvFile.name}</p>
                      <p className="text-[10px] text-emerald-600">{(csvFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDragDrop(e, 'csv')}
                onClick={() => csvInputRef.current?.click()}
                className="border border-dashed border-slate-200 hover:bg-slate-50/50 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[120px]"
              >
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="font-bold text-slate-800 text-xs">Drag CSV file here</p>
                <p className="text-[10px] text-slate-400 mt-0.5">or click to browse local files</p>
              </div>
            )}
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvSelect}
              className="hidden"
            />
          </div>
          {csvFile && (
            <Button
              variant="outline"
              className="w-full h-9 text-xs text-gray-500 border-gray-300 hover:bg-gray-50 cursor-pointer mt-4"
              onClick={() => {
                setCsvFile(null)
                setValidationResult(null)
                if (csvInputRef.current) csvInputRef.current.value = ''
              }}
            >
              Change CSV File
            </Button>
          )}
        </Card>

        {/* Column 3: Product Images ZIP (ZIP) */}
        <Card className={`p-5 border-2 transition h-full flex flex-col justify-between rounded-2xl ${zipFile ? 'border-orange-300 bg-orange-50/10' : 'border-dashed border-gray-300 hover:border-orange-400 bg-white'}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className={`h-5 w-5 ${zipFile ? 'text-orange-650' : 'text-slate-450'}`} />
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Product Images ZIP</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Optional</span>
            </div>

            {zipFile ? (
              <div className="space-y-4">
                <div className="bg-white border border-orange-100 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className="h-8 w-8 text-orange-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-orange-950 truncate text-xs">{zipFile.name}</p>
                      <p className="text-[10px] text-orange-700">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDragDrop(e, 'zip')}
                onClick={() => zipInputRef.current?.click()}
                className="border border-dashed border-slate-200 hover:bg-slate-50/50 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[120px]"
              >
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="font-bold text-slate-800 text-xs">Drag ZIP file here</p>
                <p className="text-[10px] text-slate-400 mt-0.5">or click to browse product images</p>
              </div>
            )}
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip"
              onChange={handleZipSelect}
              className="hidden"
            />
          </div>
          {zipFile && (
            <Button
              variant="outline"
              className="w-full h-9 text-xs text-gray-500 border-gray-300 hover:bg-gray-50 cursor-pointer mt-4"
              onClick={() => {
                setZipFile(null)
                if (zipInputRef.current) zipInputRef.current.value = ''
              }}
            >
              Remove ZIP File
            </Button>
          )}
        </Card>
      </div>

      {/* Row 2: Validation Results & Final Results Side-by-Side */}
      {(validating || validationResult || result) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Validation/Status Column */}
          <div className="lg:col-span-2 space-y-6">
            {(validating || validationResult) && (
              <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <RefreshCw className={`h-5 w-5 text-orange-500 ${validating ? 'animate-spin' : ''}`} />
                    Pre-Upload Data Verification
                  </h3>
                  {validating && <span className="text-xs text-slate-450 font-bold">Checking data rows...</span>}
                </div>

                {validating ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="h-10 w-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 mt-3 font-bold">Running automatic validation checks...</p>
                  </div>
                ) : (
                  validationResult && (
                    <div className="space-y-6">
                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center">
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Rows</p>
                          <p className="text-xl font-extrabold text-slate-900 mt-1">{validationResult.summary.totalProducts}</p>
                        </div>
                        <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-xl text-center">
                          <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">✓ Valid Rows</p>
                          <p className="text-xl font-extrabold text-emerald-700 mt-1">{validRowsCount}</p>
                        </div>
                        <div className="bg-rose-50/30 border border-rose-100 p-4 rounded-xl text-center">
                          <p className="text-[10px] text-rose-700 font-extrabold uppercase tracking-wider">✗ Invalid Rows</p>
                          <p className="text-xl font-extrabold text-rose-700 mt-1">{invalidRowsCount}</p>
                        </div>
                        <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl text-center">
                          <p className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">⚠ Warnings</p>
                          <p className="text-xl font-extrabold text-amber-600 mt-1">{totalWarnings}</p>
                        </div>
                      </div>

                      {/* Collapsible Issues Lists */}
                      {(totalErrors > 0 || totalWarnings > 0) && (
                        <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between p-4 bg-slate-100/50 hover:bg-slate-100/80 transition cursor-pointer"
                            onClick={() => setShowIssuesList(!showIssuesList)}
                          >
                            <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                              {invalidRowsCount > 0 ? (
                                <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                              ) : (
                                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                              )}
                              Found {totalErrors} errors & {totalWarnings} warnings in {validationResult.summary.totalProducts} rows
                            </span>
                            {showIssuesList ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>

                          {showIssuesList && (
                            <div className="max-h-72 overflow-y-auto p-4 space-y-3 bg-white border-t border-slate-150 divide-y divide-slate-100">
                              {/* Global Warnings */}
                              {validationResult.warnings.map((warn, i) => (
                                <div key={`g-warn-${i}`} className="pt-2 flex gap-2.5 text-xs text-amber-950 font-medium bg-amber-50/20 p-2.5 rounded border border-amber-100">
                                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 flex-shrink-0" />
                                  <span>Global Warning: {warn}</span>
                                </div>
                              ))}

                              {/* Row specific errors/warnings */}
                              {validationResult.products.map((p, idx) => {
                                const hasErrors = p.errors && p.errors.length > 0
                                const hasWarnings = p.warnings && p.warnings.length > 0
                                if (!hasErrors && !hasWarnings) return null

                                return (
                                  <div key={`p-row-${idx}`} className="pt-3 first:pt-0">
                                    <p className="font-bold text-slate-800 text-xs">
                                      Row {idx + 2} — <span className="text-slate-450 font-normal">{p.title}</span>
                                    </p>
                                    <div className="space-y-1 mt-1.5 pl-3 border-l-2 border-orange-200">
                                      {p.errors?.map((err, errIdx) => (
                                        <div key={errIdx} className="flex gap-2 text-2xs text-rose-600 font-medium">
                                          <span className="text-rose-500 font-bold">Error:</span>
                                          <span>{err}</span>
                                        </div>
                                      ))}
                                      {p.warnings?.map((warn, warnIdx) => (
                                        <div key={warnIdx} className="flex gap-2 text-2xs text-amber-600 font-medium">
                                          <span className="text-amber-500 font-bold">Warning:</span>
                                          <span>{warn}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Validation Callout */}
                      {invalidRowsCount > 0 ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 text-rose-900 text-xs">
                          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold">Errors found in spreadsheet rows</p>
                            <p className="text-2xs text-rose-800 mt-1 leading-relaxed">Please fix the errors shown above in your CSV file before starting the import. Invalid rows will be skipped if you start import now.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-900 text-xs">
                          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="font-bold">All rows verified successfully!</p>
                            <p className="text-2xs text-emerald-800 mt-1 leading-relaxed">Ready for import without database clashes. You can proceed with the bulk import.</p>
                          </div>
                        </div>
                      )}

                      {/* Action Trigger Button */}
                      {csvFile && !validating && (
                        <div className="flex justify-center pt-2">
                          <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            size="lg"
                            variant={invalidRowsCount > 0 ? 'secondary' : 'primary'}
                            className="px-10 h-11 text-sm font-bold shadow-md cursor-pointer"
                          >
                            {uploading ? (
                              <>
                                <RefreshCw className="h-4.5 w-4.5 mr-2 animate-spin" />
                                Uploading & Importing Products...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4.5 w-4.5 mr-2" />
                                {invalidRowsCount > 0 ? 'Import Only Valid Rows' : 'Start Bulk Import'}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </Card>
            )}
          </div>

          {/* Import Results Summary Column (takes 1 col) */}
          <div className="lg:col-span-1">
            {result && (
              <Card className="p-5 border-2 border-orange-100 bg-white shadow-md space-y-5 rounded-2xl">
                <div className="text-center pb-3 border-b border-slate-100">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-orange-50 text-orange-500 mb-2">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900">Import Completed</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Job ID: {result.jobId}</p>
                </div>

                {/* Status details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">Total Products:</span>
                    <span className="font-bold text-slate-800">{result.summary.totalProducts}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                    <span className="text-emerald-600 font-semibold">✓ Imported Successfully:</span>
                    <span className="font-bold text-emerald-600">{result.summary.successCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                    <span className="text-rose-600 font-semibold">✗ Failed:</span>
                    <span className="font-bold text-rose-600">{result.summary.failedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                    <span className="text-amber-600 font-semibold">⚠ Warnings:</span>
                    <span className="font-bold text-amber-600">{result.products.reduce((acc, p) => acc + (p.warnings?.length || 0), 0) + result.warnings.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">Time Taken:</span>
                    <span className="font-bold text-slate-800">{result.timeTakenMs ? `${(result.timeTakenMs / 1000).toFixed(2)}s` : 'N/A'}</span>
                  </div>
                </div>

                {/* Call-to-actions */}
                <div className="space-y-2 pt-1.5">
                  <Button variant="primary" className="w-full h-10 text-xs cursor-pointer flex justify-center items-center" onClick={downloadReport}>
                    <Download className="h-4.5 w-4.5 mr-2" />
                    Download Detailed Report
                  </Button>
                  <Button variant="outline" className="w-full h-10 text-xs cursor-pointer flex justify-center items-center text-orange-650 border-orange-200 hover:bg-orange-50" onClick={() => navigate('/admin/products')}>
                    Go to Products List
                    <ArrowRight className="h-3.5 w-3.5 ml-2" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full h-9 text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                    onClick={() => {
                      setCsvFile(null)
                      setZipFile(null)
                      setResult(null)
                      setValidationResult(null)
                      if (csvInputRef.current) csvInputRef.current.value = ''
                      if (zipInputRef.current) zipInputRef.current.value = ''
                    }}
                  >
                    Import Another File
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Redesigned Instructions Modal */}
      <Modal
        open={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        title="Product Import Guide"
        className="sm:max-w-3xl max-h-[90vh] p-6 overflow-hidden flex flex-col rounded-2xl border-none shadow-2xl bg-white"
      >
        {instructions && (
          <div className="flex flex-col h-full max-h-[80vh] overflow-hidden">
            {/* Modal Tabs - Segmented Control styling */}
            <div className="flex border-b border-gray-150 bg-white p-3 gap-2 flex-shrink-0">
              <button
                type="button"
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  instructionTab === 'flow'
                    ? 'bg-orange-50 text-orange-600 shadow-xs border border-orange-100/50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setInstructionTab('flow')}
              >
                <Zap className="h-4 w-4" />
                1. Import Workflow
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  instructionTab === 'fields'
                    ? 'bg-orange-50 text-orange-600 shadow-xs border border-orange-100/50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setInstructionTab('fields')}
              >
                <FileText className="h-4 w-4" />
                2. Spreadsheet Details
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  instructionTab === 'errors'
                    ? 'bg-rose-50 text-rose-600 shadow-xs border border-rose-100/50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setInstructionTab('errors')}
              >
                <AlertTriangle className="h-4 w-4" />
                3. Avoid Mistakes
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700 bg-slate-50/50">
              {instructionTab === 'flow' && (
                <div className="space-y-6">
                  {/* System Overview */}
                  <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
                    <p className="font-extrabold text-gray-900 text-base mb-1.5">Overview</p>
                    <p className="text-gray-650 text-xs leading-relaxed font-medium">{instructions.overview}</p>
                  </div>

                  {/* Step list */}
                  <div>
                    <h4 className="font-extrabold text-gray-905 mb-3.5 text-xs uppercase tracking-wider text-orange-950">Simple Step-by-Step Guide</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {instructions.workflow.map((step, idx) => {
                        const cleanStep = step.includes(':') ? step.split(':').slice(1).join(':').trim() : step;
                        const stepTitle = step.includes(':') ? step.split(':')[0].trim() : `Step ${idx + 1}`;
                        return (
                          <div key={idx} className="flex gap-4 items-start bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md transition duration-200">
                            <span className="h-7 w-7 rounded-xl bg-orange-50 text-orange-600 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900 text-xs uppercase tracking-wide mb-0.5">{stepTitle}</p>
                              <p className="text-gray-500 text-xs leading-relaxed font-medium">{cleanStep}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Constraints list */}
                  <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-xs">
                    <h4 className="font-extrabold text-gray-950 mb-1 text-xs uppercase tracking-wider">File Limits & Guidelines</h4>
                    <p className="text-2xs text-gray-500 mb-4 font-medium">Please verify your documents match these sizes before uploading:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                      <div className="flex flex-col bg-slate-50 border border-gray-150 p-3.5 rounded-xl text-center">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-3xs">Accepted Format</span>
                        <span className="font-extrabold text-orange-950 mt-1">CSV (Spreadsheet)</span>
                      </div>
                      <div className="flex flex-col bg-slate-50 border border-gray-150 p-3.5 rounded-xl text-center">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-3xs">Max File Size</span>
                        <span className="font-extrabold text-orange-950 mt-1">10 MB Document</span>
                      </div>
                      <div className="flex flex-col bg-slate-50 border border-gray-150 p-3.5 rounded-xl text-center">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-3xs">Max Row Limit</span>
                        <span className="font-extrabold text-orange-950 mt-1">10,000 Products</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {instructionTab === 'fields' && (
                <div className="space-y-6">
                  {/* Categorization & Brands info cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">Categories & Brands</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        You can type either the exact Category Name or its code. Brands automatically match; if a brand is new, the system can automatically create it for you!
                      </p>
                    </div>
                    <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">No Need for Suffixes or Symbols</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Prices do not need symbols like ₹ or currency text. For example, typing <span className="font-semibold text-gray-800">₹500</span> or <span className="font-semibold text-gray-800">500 Rs</span> will automatically be cleaned to <span className="font-bold text-orange-650">500</span>.
                      </p>
                    </div>
                  </div>

                  {/* Accepted values list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">Weight Units</h4>
                      <p className="text-xs text-gray-500 mb-3 font-medium">Supported units (typed in the weight unit column):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ALLOWED_WEIGHT_UNITS.map(unit => (
                          <span key={unit} className="text-2xs font-extrabold bg-orange-50/70 border border-orange-100 text-orange-600 px-2 py-0.5 rounded-md font-mono">{unit}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">Yes / No Switch Fields</h4>
                      <p className="text-xs text-gray-500 mb-3 font-medium">Accepted terms for setting active products or free delivery:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['yes', 'no', 'true', 'false', '1', '0'].map(val => (
                          <span key={val} className="text-2xs font-extrabold bg-slate-100 border text-slate-700 px-2 py-0.5 rounded-md font-mono">{val}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fields Breakdown list */}
                  <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-50 p-4 border-b border-gray-150 flex justify-between items-center">
                      <span className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Spreadsheet Columns Guide</span>
                    </div>
                    <div className="p-4 max-h-56 overflow-y-auto divide-y divide-gray-100">
                      <div className="py-2.5 grid grid-cols-3 gap-2">
                        <span className="font-extrabold text-xs text-orange-600 font-mono">title, brand, category, price, mrp, stock</span>
                        <span className="col-span-2 text-xs text-gray-600 font-medium">
                          <strong className="text-orange-950">Required.</strong> Name, manufacturer brand, category name, selling price, MRP, and stock number.
                        </span>
                      </div>
                      <div className="py-2.5 grid grid-cols-3 gap-2">
                        <span className="font-extrabold text-xs text-gray-700 font-mono">tags</span>
                        <span className="col-span-2 text-xs text-gray-600 font-medium">Words separated by commas (e.g. bestseller, organic) to help customers find products easily.</span>
                      </div>
                      <div className="py-2.5 grid grid-cols-3 gap-2">
                        <span className="col-span-2 text-xs text-gray-600 font-medium">Optional descriptions, key bullet points, shipping days (e.g. 2), or return timelines.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {instructionTab === 'errors' && (
                <div className="space-y-5">
                  <h4 className="font-extrabold text-gray-950 text-xs uppercase tracking-wider mb-2">How to avoid errors during import</h4>

                  <div className="space-y-4">
                    {/* Error Item 1 */}
                    <div className="bg-white border-l-4 border-rose-500 rounded-2xl p-5 shadow-xs relative overflow-hidden flex gap-4 transition hover:translate-x-1 duration-200">
                      <AlertCircle className="h-6 w-6 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-gray-900 text-sm">Selling Price Higher Than MRP</p>
                        <p className="mt-1 text-xs text-gray-500 leading-relaxed font-medium">
                          A product's actual price cannot exceed its Maximum Retail Price (MRP).
                        </p>
                        <div className="mt-3 flex items-center gap-3.5 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 text-3xs font-bold uppercase tracking-wider">
                          <span className="text-rose-700">Incorrect: Price = ₹500, MRP = ₹450</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-emerald-700">Correct: Price = ₹450, MRP = ₹500</span>
                        </div>
                      </div>
                    </div>

                    {/* Error Item 2 */}
                    <div className="bg-white border-l-4 border-rose-500 rounded-2xl p-5 shadow-xs relative overflow-hidden flex gap-4 transition hover:translate-x-1 duration-200">
                      <AlertCircle className="h-6 w-6 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-gray-900 text-sm">Using the Same Code or Name Twice</p>
                        <p className="mt-1 text-xs text-gray-500 leading-relaxed font-medium">
                          Each product code (SKU) or product name must be unique. The system checks your spreadsheet rows to make sure there are no duplicate values within the file or in the existing store database.
                        </p>
                      </div>
                    </div>

                    {/* Error Item 3 */}
                    <div className="bg-white border-l-4 border-amber-500 rounded-2xl p-5 shadow-xs relative overflow-hidden flex gap-4 transition hover:translate-x-1 duration-200">
                      <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-gray-900 text-sm">Double Check Columns Layout</p>
                        <p className="mt-1 text-xs text-gray-500 leading-relaxed font-medium">
                          Always use the downloadable spreadsheet template. Do not rename, remove, or rearrange any column headers to ensure the importer can read all your products successfully.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3.5 p-5 bg-white border-t justify-end flex-shrink-0">
              <Button variant="outline" className="h-10 px-5 text-gray-600 border-gray-200 cursor-pointer" onClick={() => setShowInstructionsModal(false)}>
                Close
              </Button>
              <Button variant="primary" className="h-10 px-5 cursor-pointer" onClick={downloadInstructionsTxt}>
                <Download className="h-4.5 w-4.5 mr-1.5" />
                Download Guide
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
