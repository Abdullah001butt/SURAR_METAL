import { useRef, useState } from 'react'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { uploadToBucket } from '@/admin/utils/storageUpload'
import type { ProjectDocument } from '@/admin/types'

interface MultiPhotosFieldProps {
  bucket: string
  folder?: string
  value: string[]
  onChange: (urls: string[]) => void
}

export function MultiPhotosField({ bucket, folder, value, onChange }: MultiPhotosFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadToBucket(bucket, f, folder)))
      onChange([...value, ...urls])
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-gray">Photos</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
      <div className="mt-2 grid grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-bg">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-navy/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="grid aspect-square place-items-center rounded-lg border border-dashed border-navy/20 text-gray hover:border-primary/40 hover:text-primary"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        </button>
      </div>
    </div>
  )
}

interface MultiDocumentsFieldProps {
  bucket: string
  folder?: string
  value: ProjectDocument[]
  onChange: (docs: ProjectDocument[]) => void
}

export function MultiDocumentsField({ bucket, folder, value, onChange }: MultiDocumentsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    try {
      const docs = await Promise.all(
        Array.from(files).map(async (f) => ({ name: f.name, url: await uploadToBucket(bucket, f, folder) })),
      )
      onChange([...value, ...docs])
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-gray">Documents</label>
      <input ref={inputRef} type="file" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
      <div className="mt-2 space-y-2">
        {value.map((doc, i) => (
          <div key={doc.url} className="flex items-center gap-2 rounded-lg border border-navy/10 bg-bg p-2">
            <FileText size={16} className="shrink-0 text-primary" />
            <a href={doc.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-xs text-primary hover:underline" dir="ltr">
              {doc.name}
            </a>
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600">
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-navy/20 bg-bg px-4 py-2.5 text-sm text-gray hover:border-primary/40 hover:text-primary"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </button>
      </div>
    </div>
  )
}
