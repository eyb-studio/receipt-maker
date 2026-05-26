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
