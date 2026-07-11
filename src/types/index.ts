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

export type PriceListConfig = {
  itemsPerColumn: number
  maxColumns: number
}

export const DEFAULT_PRICE_LIST_CONFIG: PriceListConfig = {
  itemsPerColumn: 30,
  maxColumns: 3,
}

export type LedgerColumns = {
  invoice: boolean
  commission: boolean
  cash: boolean
  balance: boolean
  date: boolean
}

export const DEFAULT_LEDGER_COLUMNS: LedgerColumns = {
  invoice: true,
  commission: true,
  cash: true,
  balance: true,
  date: true,
}

export type Company = {
  name: string
  logo?: string
  primaryColor: string
  accentColor: string
  receiptColumns?: ReceiptColumns
  priceListConfig?: PriceListConfig
  ledgerColumns?: LedgerColumns
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

// A single هزینه (cost) line within the expenses breakdown, e.g. برف / حمالی.
export type ExpenseItem = {
  id: string
  label: string
  amount: number
}

export type PriceList = {
  id: string
  number: number
  title: string // customer / list name
  date: string
  basketCount?: number // تعداد باسکت
  items: PriceListItem[]
  // حق (commission) deducted from the items subtotal. Either a flat amount or
  // a percentage of the subtotal, depending on commissionIsPercent.
  commission?: number
  commissionIsPercent?: boolean
  // هزینه‌ها (expenses) — itemized cost lines, all deducted from the subtotal.
  expenseItems?: ExpenseItem[]
  // Legacy single-amount expenses, kept for backward compatibility.
  expenses?: number
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
