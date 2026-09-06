import { KEYS } from "@/lib/storage"

// Everything the app owns, in one file. The new Next.js app reads this shape
// on its import screen — it is the only way data leaves this build, so it has
// to be complete rather than convenient.

export const BACKUP_VERSION = 1

export type Backup = {
  app: "receipt-maker"
  version: number
  exportedAt: string
  schemaVersion: number
  data: {
    company: unknown
    clients: unknown
    products: unknown
    receipts: unknown
    ledgers: unknown
    priceLists: unknown
    priceCatalog: unknown
    manReceipts: unknown
    manCatalog: unknown
    counters: {
      receipt: unknown
      ledger: unknown
      priceList: unknown
      manReceipt: unknown
    }
    language: string | null
  }
}

// Values are copied out as parsed JSON, not raw strings, so the importer never
// has to double-parse. A key that is missing or corrupt exports as null rather
// than aborting the whole backup.
function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function buildBackup(): Backup {
  return {
    app: "receipt-maker",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    schemaVersion: Number(window.localStorage.getItem(KEYS.schemaVersion) ?? "1"),
    data: {
      company: read(KEYS.company),
      clients: read(KEYS.clients),
      products: read(KEYS.products),
      receipts: read(KEYS.receipts),
      ledgers: read(KEYS.ledgers),
      priceLists: read(KEYS.priceLists),
      priceCatalog: read(KEYS.priceCatalog),
      manReceipts: read(KEYS.manReceipts),
      manCatalog: read(KEYS.manCatalog),
      counters: {
        receipt: read(KEYS.counter),
        ledger: read(KEYS.ledgerCounter),
        priceList: read(KEYS.priceListCounter),
        manReceipt: read(KEYS.manReceiptCounter),
      },
      language: window.localStorage.getItem("receipt-maker:language"),
    },
  }
}

// Counts the documents in a backup so the UI can tell the user what they just
// downloaded — a silent 2 KB file is indistinguishable from a broken export.
export function countDocuments(backup: Backup): number {
  const { receipts, ledgers, priceLists, manReceipts } = backup.data
  return [receipts, ledgers, priceLists, manReceipts].reduce<number>(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  )
}

// The backup as a File, so it can be handed to either a download link or the
// share sheet without building the JSON twice.
export function backupFile(): { file: File; count: number } {
  const backup = buildBackup()
  const json = JSON.stringify(backup, null, 2)
  const name = `receipt-maker-backup-${backup.exportedAt.slice(0, 10)}.json`
  return {
    file: new File([json], name, { type: "application/json" }),
    count: countDocuments(backup),
  }
}

export function downloadBackup(): number {
  const { file, count } = backupFile()
  const url = URL.createObjectURL(file)
  const a = document.createElement("a")
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return count
}

export type ShareResult = "shared" | "cancelled" | "unsupported"

// The data lives on the owner's phone and has to reach someone else, so the
// share sheet — WhatsApp, mail, Files — is the path that actually works. An
// installed PWA on iOS does not reliably honour a download link.
export function canShareBackup(): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false
  try {
    // Probing with a real File is the only reliable check: canShare() reports
    // on the payload, not on the API's mere existence.
    return navigator.canShare({
      files: [new File(["{}"], "probe.json", { type: "application/json" })],
    })
  } catch {
    return false
  }
}

export async function shareBackup(): Promise<{ result: ShareResult; count: number }> {
  const { file, count } = backupFile()
  if (!canShareBackup()) return { result: "unsupported", count }
  try {
    await navigator.share({ files: [file], title: file.name })
    return { result: "shared", count }
  } catch (error) {
    // Dismissing the share sheet rejects with AbortError. That is the user
    // changing their mind, not a failure worth an error toast.
    if (error instanceof DOMException && error.name === "AbortError") {
      return { result: "cancelled", count }
    }
    return { result: "unsupported", count }
  }
}
