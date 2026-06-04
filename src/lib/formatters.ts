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
