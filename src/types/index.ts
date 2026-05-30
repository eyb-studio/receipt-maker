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
