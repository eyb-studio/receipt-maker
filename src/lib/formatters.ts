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

// Pick a sensible column count for an itemized list, then split the items
// column-major (fill the first column top-to-bottom, then the next) so the
// printed sheet reads the way a hand-written ledger does.
export function pickColumnCount(itemCount: number): number {
  if (itemCount <= 12) return 1
  if (itemCount <= 28) return 2
  return 3
}

export function splitIntoColumns<T>(items: T[], columns: number): T[][] {
  if (columns <= 1 || items.length === 0) return [items]
  const perColumn = Math.ceil(items.length / columns)
  const result: T[][] = []
  for (let i = 0; i < items.length; i += perColumn) {
    result.push(items.slice(i, i + perColumn))
  }
  return result
}
