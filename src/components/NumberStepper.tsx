import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toLatinDigits } from "@/lib/digits"

type NumberStepperProps = {
  value: string
  onChange: (value: string) => void
  step?: number
  min?: number
  placeholder?: string
  ariaLabel?: string
}

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  placeholder,
  ariaLabel,
}: NumberStepperProps) {
  const adjust = (delta: number) => {
    const current = Number(value) || 0
    const next = Math.max(min, current + delta)
    onChange(String(next))
  }

  return (
    <div className="flex items-center" dir="ltr">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 shrink-0 rounded-r-none border-r-0"
        onClick={() => adjust(-step)}
        aria-label={`-${step}`}
      >
        <Minus className="size-4" />
      </Button>
      <Input
        type="text"
        inputMode="decimal"
        dir="ltr"
        className="h-9 rounded-none text-center tabular-nums focus-visible:z-10"
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(toLatinDigits(e.target.value))}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 shrink-0 rounded-l-none border-l-0"
        onClick={() => adjust(step)}
        aria-label={`+${step}`}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}
