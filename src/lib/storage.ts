import { useEffect, useState, useCallback } from "react"
import { DEFAULT_PRICE_LIST_CONFIG } from "@/types"
import type { CatalogItem, Client, Company, Ledger, PriceList, Product, Receipt } from "@/types"

const KEYS = {
  company: "receipt-maker:company",
  clients: "receipt-maker:clients",
  products: "receipt-maker:products",
  receipts: "receipt-maker:receipts",
  counter: "receipt-maker:receipt-counter",
  ledgers: "receipt-maker:ledgers",
  ledgerCounter: "receipt-maker:ledger-counter",
  priceLists: "receipt-maker:price-lists",
  priceListCounter: "receipt-maker:price-list-counter",
  priceCatalog: "receipt-maker:price-catalog",
  schemaVersion: "receipt-maker:schema-version",
} as const

const SCHEMA_VERSION = 2

if (typeof window !== "undefined") {
  try {
    const current = Number(window.localStorage.getItem(KEYS.schemaVersion) ?? "1")
    if (current < SCHEMA_VERSION) {
      // v2 — weights are kg-only; legacy mixed-unit data is dropped
      window.localStorage.removeItem(KEYS.products)
      window.localStorage.removeItem(KEYS.receipts)
      window.localStorage.setItem(KEYS.schemaVersion, String(SCHEMA_VERSION))
    }
  } catch {}
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

const STORAGE_EVENT = "receipt-maker:storage-change"

function emit(key: string) {
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }))
}

function useStored<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readJSON(key, fallback))

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail
      if (detail?.key === key) {
        setValue(readJSON(key, fallback))
      }
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(readJSON(key, fallback))
    }
    window.addEventListener(STORAGE_EVENT, onChange)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(STORAGE_EVENT, onChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [key, fallback])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next
        writeJSON(key, resolved)
        emit(key)
        return resolved
      })
    },
    [key]
  )

  return [value, update]
}

const DEFAULT_COMPANY: Company = {
  name: "",
  logo: undefined,
  primaryColor: "#1f2937",
  accentColor: "#7c3aed",
  priceListConfig: DEFAULT_PRICE_LIST_CONFIG,
}

export function useCompany() {
  const [company, setCompany] = useStored<Company>(KEYS.company, DEFAULT_COMPANY)
  return { company, setCompany }
}

export function useClients() {
  const [clients, setClients] = useStored<Client[]>(KEYS.clients, [])

  const addClient = (data: Omit<Client, "id" | "createdAt">) => {
    const client: Client = { ...data, id: crypto.randomUUID(), createdAt: Date.now() }
    setClients((prev) => [client, ...prev])
    return client
  }

  const updateClient = (id: string, data: Partial<Omit<Client, "id" | "createdAt">>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  return { clients, addClient, updateClient, deleteClient }
}

export function useProducts() {
  const [products, setProducts] = useStored<Product[]>(KEYS.products, [])

  const addProduct = (data: Omit<Product, "id" | "createdAt">) => {
    const product: Product = { ...data, id: crypto.randomUUID(), createdAt: Date.now() }
    setProducts((prev) => [product, ...prev])
    return product
  }

  const updateProduct = (id: string, data: Partial<Omit<Product, "id" | "createdAt">>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return { products, addProduct, updateProduct, deleteProduct }
}

function nextReceiptNumber(): number {
  const current = readJSON<number>(KEYS.counter, 1000)
  const next = current + 1
  writeJSON(KEYS.counter, next)
  return next
}

export function useReceipts() {
  const [receipts, setReceipts] = useStored<Receipt[]>(KEYS.receipts, [])

  const addReceipt = (data: Omit<Receipt, "id" | "createdAt" | "number">) => {
    const receipt: Receipt = {
      ...data,
      id: crypto.randomUUID(),
      number: nextReceiptNumber(),
      createdAt: Date.now(),
    }
    setReceipts((prev) => [receipt, ...prev])
    return receipt
  }

  const updateReceipt = (id: string, data: Partial<Omit<Receipt, "id" | "createdAt" | "number">>) => {
    setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }

  const deleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id))
  }

  const getReceipt = (id: string) => receipts.find((r) => r.id === id)

  return { receipts, addReceipt, updateReceipt, deleteReceipt, getReceipt }
}

function nextLedgerNumber(): number {
  const current = readJSON<number>(KEYS.ledgerCounter, 1000)
  const next = current + 1
  writeJSON(KEYS.ledgerCounter, next)
  return next
}

export function useLedgers() {
  const [ledgers, setLedgers] = useStored<Ledger[]>(KEYS.ledgers, [])

  const addLedger = (data: Omit<Ledger, "id" | "createdAt" | "number">) => {
    const ledger: Ledger = {
      ...data,
      id: crypto.randomUUID(),
      number: nextLedgerNumber(),
      createdAt: Date.now(),
    }
    setLedgers((prev) => [ledger, ...prev])
    return ledger
  }

  const updateLedger = (id: string, data: Partial<Omit<Ledger, "id" | "createdAt" | "number">>) => {
    setLedgers((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)))
  }

  const deleteLedger = (id: string) => {
    setLedgers((prev) => prev.filter((l) => l.id !== id))
  }

  const getLedger = (id: string) => ledgers.find((l) => l.id === id)

  return { ledgers, addLedger, updateLedger, deleteLedger, getLedger }
}

// ── Price-list item catalog (autocomplete source) ───────────────────────────

export function usePriceCatalog() {
  const [catalog, setCatalog] = useStored<CatalogItem[]>(KEYS.priceCatalog, [])

  const addCatalogItem = (data: Omit<CatalogItem, "id" | "createdAt">) => {
    const item: CatalogItem = { ...data, id: crypto.randomUUID(), createdAt: Date.now() }
    setCatalog((prev) => [item, ...prev])
    return item
  }

  const updateCatalogItem = (
    id: string,
    data: Partial<Omit<CatalogItem, "id" | "createdAt">>
  ) => {
    setCatalog((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const deleteCatalogItem = (id: string) => {
    setCatalog((prev) => prev.filter((c) => c.id !== id))
  }

  // Upsert items by case-insensitive name, keeping the latest price. Called
  // automatically when a price list is saved so the catalog learns over time.
  const learnItems = (items: { name: string; price: number }[]) => {
    setCatalog((prev) => {
      const byName = new Map(prev.map((c) => [c.name.trim().toLowerCase(), c]))
      for (const it of items) {
        const name = it.name.trim()
        if (!name) continue
        const key = name.toLowerCase()
        const existing = byName.get(key)
        if (existing) {
          byName.set(key, { ...existing, name, price: it.price })
        } else {
          byName.set(key, {
            id: crypto.randomUUID(),
            name,
            price: it.price,
            createdAt: Date.now(),
          })
        }
      }
      return Array.from(byName.values()).sort((a, b) => b.createdAt - a.createdAt)
    })
  }

  return { catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem, learnItems }
}

function nextPriceListNumber(): number {
  const current = readJSON<number>(KEYS.priceListCounter, 1000)
  const next = current + 1
  writeJSON(KEYS.priceListCounter, next)
  return next
}

export function usePriceLists() {
  const [priceLists, setPriceLists] = useStored<PriceList[]>(KEYS.priceLists, [])

  const addPriceList = (data: Omit<PriceList, "id" | "createdAt" | "number">) => {
    const priceList: PriceList = {
      ...data,
      id: crypto.randomUUID(),
      number: nextPriceListNumber(),
      createdAt: Date.now(),
    }
    setPriceLists((prev) => [priceList, ...prev])
    return priceList
  }

  const updatePriceList = (
    id: string,
    data: Partial<Omit<PriceList, "id" | "createdAt" | "number">>
  ) => {
    setPriceLists((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }

  const deletePriceList = (id: string) => {
    setPriceLists((prev) => prev.filter((p) => p.id !== id))
  }

  const getPriceList = (id: string) => priceLists.find((p) => p.id === id)

  return { priceLists, addPriceList, updatePriceList, deletePriceList, getPriceList }
}
