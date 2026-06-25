export function formatUnitWeight(value: number): string {
  if (!isFinite(value)) return ""
  return stripTrailing(value.toFixed(2))
}

export function formatTotalWeight(kg: number): string {
  if (!isFinite(kg)) return ""
  return `${stripTrailing(kg.toFixed(2))} kg`
}

function stripTrailing(s: string): string {
  if (!s.includes(".")) return s
  return s.replace(/0+$/, "").replace(/\.$/, "")
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  if (!isFinite(value)) return "AED 0"
  return `AED ${moneyFormatter.format(value)}`
}

export function formatAmount(value: number): string {
  if (!isFinite(value)) return "0"
  return moneyFormatter.format(value)
}

export function rowBalance(row: {
  invoice: number
  commission: number
  cash: number
}): number {
  return row.invoice + row.commission - row.cash
}

// Flow items into columns column-major (fill the first column top-to-bottom,
// then the next) so the printed sheet reads like a hand-written ledger. A new
// column is added each time an existing one fills past `itemsPerColumn`, capped
// at `maxColumns`. Beyond that cap the columns simply grow taller.
export function layoutColumns<T>(
  items: T[],
  itemsPerColumn: number,
  maxColumns: number
): T[][] {
  const count = items.length
  if (count === 0) return [[]]
  const perCol = Math.max(1, Math.floor(itemsPerColumn) || 1)
  const cap = Math.max(1, Math.floor(maxColumns) || 1)
  const columns = Math.min(Math.ceil(count / perCol), cap)
  const balanced = Math.ceil(count / columns)
  const result: T[][] = []
  for (let i = 0; i < count; i += balanced) {
    result.push(items.slice(i, i + balanced))
  }
  return result
}

// Shared money math for a fish receipt: subtotal of items, then حق (commission,
// flat or % of subtotal) and هزینه‌ها (expenses, flat) are both deducted.
export function priceListTotals(pl: {
  items: { price: number }[]
  commission?: number
  commissionIsPercent?: boolean
  expenseItems?: { amount: number }[]
  expenses?: number
}): { subtotal: number; commission: number; expenses: number; grandTotal: number } {
  const subtotal = pl.items.reduce((sum, it) => sum + (it.price || 0), 0)
  const rawCommission = pl.commission ?? 0
  const commission = pl.commissionIsPercent
    ? (subtotal * rawCommission) / 100
    : rawCommission
  const expenses =
    pl.expenseItems && pl.expenseItems.length
      ? pl.expenseItems.reduce((sum, e) => sum + (e.amount || 0), 0)
      : (pl.expenses ?? 0)
  const grandTotal = subtotal - commission - expenses
  return { subtotal, commission, expenses, grandTotal }
}
