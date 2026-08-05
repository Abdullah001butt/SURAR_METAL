// The Gemini API key lives only in this browser's localStorage — never in
// source code or committed anywhere. It's entered once via the Settings page
// and used directly from the browser to call Google's API, so there's no
// server/serverless function involved at all (matches the "client-side,
// paste my own key" request — no deploy step needed when the key changes).

const STORAGE_KEY = 'al-surur-gemini-api-key'

export function getGeminiApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setGeminiApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key.trim())
}

export function clearGeminiApiKey() {
  localStorage.removeItem(STORAGE_KEY)
}
