import { supabase } from '@/services/supabase'
import { sanitizeFilename } from '@/admin/utils/pdfExport'

export async function uploadToBucket(bucket: string, file: File, folder = ''): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin'
  const base = sanitizeFilename(file.name.replace(/\.[^.]+$/, ''))
  const path = `${folder ? `${folder}/` : ''}${base}-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
