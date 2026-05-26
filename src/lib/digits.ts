const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"

export function toLatinDigits(input: string): string {
  let out = ""
  for (const ch of input) {
    const pIdx = PERSIAN_DIGITS.indexOf(ch)
    if (pIdx !== -1) {
      out += String(pIdx)
      continue
    }
    const aIdx = ARABIC_DIGITS.indexOf(ch)
    if (aIdx !== -1) {
      out += String(aIdx)
      continue
    }
    out += ch
  }
  return out
}
