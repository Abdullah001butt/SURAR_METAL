import { useRef, useState } from 'react'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { uploadToBucket } from '@/admin/utils/storageUpload'

interface FileUploadFieldProps {
  bucket: string
  folder?: string
  value: string | null
  onChange: (url: string | null) => void
  accept?: string
  label: string
  preview?: 'image' | 'file'
}

export function FileUploadField({ bucket, folder, value, onChange, accept, label, preview = 'image' }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadToBucket(bucket, file, folder)
      onChange(url)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-gray">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      {value ? (
        <div className="mt-1 flex items-center gap-3 rounded-lg border border-navy/10 bg-bg p-2">
          {preview === 'image' ? (
            <img src={value} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileText size={22} />
            </div>
          )}
          <a href={value} target="_blank" rel="noreferrer" className="flex-1 truncate text-xs text-primary hover:underline" dir="ltr">
            {value.split('/').pop()}
          </a>
          <button type="button" onClick={() => onChange(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-navy/20 bg-bg px-4 py-3 text-sm text-gray hover:border-primary/40 hover:text-primary"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : `Upload ${label}`}
        </button>
      )}
    </div>
  )
}
