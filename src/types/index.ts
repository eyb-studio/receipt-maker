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

export type PriceListItem = {
  id: string
  name: string
  price: number
}

export type PriceList = {
  id: string
  number: number
  title: string // customer / list name
  date: string
  items: PriceListItem[]
  notes?: string
  createdAt: number
}

// Auto-learned catalog of item names + their last-used price, used to
// power autocomplete in the price-list editor. Also editable by hand.
export type CatalogItem = {
  id: string
  name: string
  price: number
  createdAt: number
}
