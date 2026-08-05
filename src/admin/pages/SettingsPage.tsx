import { useState } from 'react'
import { Check, Eye, EyeOff, KeyRound, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getGeminiApiKey, setGeminiApiKey, clearGeminiApiKey } from '@/admin/utils/geminiSettings'

export function SettingsPage() {
  const [key, setKey] = useState(getGeminiApiKey() ?? '')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setGeminiApiKey(key)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const clear = () => {
    clearGeminiApiKey()
    setKey('')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-navy">Settings</h1>
      <p className="mt-1 text-sm text-gray">API keys and preferences for this browser.</p>

      <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-navy/5">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-primary" />
          <h2 className="font-display text-lg font-semibold text-navy">Gemini API Key</h2>
        </div>
        <p className="mt-1 text-sm text-gray">
          Used by "Import from Photo" on quotations to read handwritten/printed quotes. Get a free key at{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="font-semibold text-primary underline">
            aistudio.google.com/apikey
          </a>
          .
        </p>
        <p className="mt-2 text-xs text-gray">
          This key is stored only in this browser (never sent to or saved on our server) — you'll need to re-paste it if you switch
          computers or clear browser storage. Requests go straight from your browser to Google's API.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={visible ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your Gemini API key..."
              dir="ltr"
              className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 pe-10 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray hover:text-navy"
              aria-label={visible ? 'Hide key' : 'Show key'}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button onClick={save} disabled={!key.trim()} icon={saved ? <Check size={16} /> : undefined}>
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>

        {getGeminiApiKey() && (
          <button
            onClick={clear}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
          >
            <Trash2 size={13} /> Remove saved key
          </button>
        )}
      </div>
    </div>
  )
}
