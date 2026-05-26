import { useEffect, useState, useCallback } from "react"
import type { Client, Company, Product, Receipt } from "@/types"

const KEYS = {
  company: "receipt-maker:company",
  clients: "receipt-maker:clients",
  products: "receipt-maker:products",
  receipts: "receipt-maker:receipts",
  counter: "receipt-maker:receipt-counter",
} as const

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
