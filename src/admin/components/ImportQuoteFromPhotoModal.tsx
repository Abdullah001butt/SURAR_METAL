import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Upload, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { extractQuoteFromPhoto, type ExtractedQuote } from '@/admin/utils/extractQuoteFromPhoto'
import { getGeminiApiKey } from '@/admin/utils/geminiSettings'

interface ImportQuoteFromPhotoModalProps {
  onClose: () => void
  onExtracted: (result: ExtractedQuote) => void
}

export function ImportQuoteFromPhotoModal({ onClose, onExtracted }: ImportQuoteFromPhotoModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasKey = !!getGeminiApiKey()

  const handleFile = async (file: File) => {
    setError(null)
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const result = await extractQuoteFromPhoto(file)
      onExtracted(result)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" onClick={loading ? undefined : onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">Import Quotation from Photo</h2>
          {!loading && <button onClick={onClose}><X size={18} className="text-gray" /></button>}
        </div>
        <p className="mt-1 text-sm text-gray">
          Upload a photo of a handwritten or printed quotation — line items, quantities and prices will be extracted automatically.
        </p>

        {!hasKey ? (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>
              No Gemini API key saved yet.{' '}
              <Link to="/dashboard/settings" onClick={onClose} className="font-semibold underline">
                Add one in Settings
              </Link>{' '}
              first — it's a one-time step per browser.
            </span>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {!preview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-navy/15 bg-bg py-12 text-gray hover:border-primary hover:text-primary"
              >
                <Upload size={28} />
                <span className="text-sm font-semibold">Click to upload a photo</span>
                <span className="text-xs">or take one with your phone camera</span>
              </button>
            ) : (
              <div className="mt-5">
                <img src={preview} alt="Quotation preview" className="max-h-64 w-full rounded-2xl object-contain ring-1 ring-navy/10" />
                {loading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                    <Loader2 size={16} className="animate-spin" /> Reading quotation...
                  </div>
                )}
                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                  </div>
                )}
                {!loading && (
                  <Button variant="ghost" className="mt-3 w-full" onClick={() => { setPreview(null); setError(null) }}>
                    Try a different photo
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
