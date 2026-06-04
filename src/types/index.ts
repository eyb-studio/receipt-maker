export type ReceiptColumns = {
  sign: boolean
  count: boolean
  unitWeight: boolean
  totalWeight: boolean
}

export const DEFAULT_RECEIPT_COLUMNS: ReceiptColumns = {
  sign: true,
  count: true,
  unitWeight: true,
  totalWeight: true,
}

export type Company = {
  name: string
  logo?: string
  primaryColor: string
  accentColor: string
  receiptColumns?: ReceiptColumns
}

export type Client = {
  id: string
  name: string
  phone?: string
  address?: string
  createdAt: number
}

export type Product = {
  id: string
  name: string
  colorName: string
  colorHex: string
  unitWeight: number
  createdAt: number
}

export type ReceiptItem = {
  id: string
  productId: string
  productName: string
  colorName: string
  colorHex: string
  unitWeight: number
  quantity: number
  weight: number
}

export type Receipt = {
  id: string
  number: number
  clientId: string | null
  clientName: string | null
  date: string
  items: ReceiptItem[]
  notes?: string
  createdAt: number
}

export type LedgerRow = {
  id: string
  name: string
  date?: string // per-row date (ISO yyyy-mm-dd)
  invoice: number // فاکتور (debit)
  commission: number // حق / كارمزد (debit)
  cash: number // صرافي (credit)
}

export type Ledger = {
  id: string
  number: number
  title: string // e.g. "حساب شوکت"
  date: string
  rows: LedgerRow[]
  notes?: string
  createdAt: number
}
