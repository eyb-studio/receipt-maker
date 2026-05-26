import type { WeightUnit } from "@/types"

const TON_THRESHOLD_GRAMS = 1_000_000

export function toGrams(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value * 1000 : value
}

export function formatUnitWeight(value: number, unit: WeightUnit): string {
  if (!isFinite(value)) return ""
  return `${stripTrailing(value.toFixed(2))} ${unit}`
}

export function formatTotalWeight(grams: number): string {
  if (!isFinite(grams)) return ""
  if (grams >= TON_THRESHOLD_GRAMS) {
    return `${stripTrailing((grams / 1_000_000).toFixed(2))} t`
  }
  return `${stripTrailing((grams / 1000).toFixed(2))} kg`
}

function stripTrailing(s: string): string {
  if (!s.includes(".")) return s
  return s.replace(/0+$/, "").replace(/\.$/, "")
}
