import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { usePriceCatalog, usePriceLists } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { PageHeader } from "@/components/PageHeader"
import { toLatinDigits } from "@/lib/digits"
import { formatAmount, formatMoney, priceListTotals, snapPriceInput } from "@/lib/formatters"
import type { CatalogItem, PriceListItem } from "@/types"

type DraftItem = {
  id: string
  name: string
  price: string
}

type DraftExpense = {
  id: string
  label: string
  amount: string
}

function newDraftExpense(): DraftExpense {
  return { id: crypto.randomUUID(), label: "", amount: "" }
}

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function newDraftItem(): DraftItem {
  return { id: crypto.randomUUID(), name: "", price: "" }
}

export function PriceListEditorPage() {
  const t = useT()
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { priceLists, addPriceList, updatePriceList } = usePriceLists()
  const { catalog, learnItems } = usePriceCatalog()

  const existing = id ? priceLists.find((p) => p.id === id) : undefined
  const isEdit = Boolean(existing)

  const [title, setTitle] = useState<string>(existing?.title ?? "")
  const [date, setDate] = useState<string>(existing?.date ?? todayISO())
  const [notes, setNotes] = useState<string>(existing?.notes ?? "")
  const [commission, setCommission] = useState<string>(
    existing?.commission ? String(existing.commission) : ""
  )
  const [commissionIsPercent, setCommissionIsPercent] = useState<boolean>(
    existing?.commissionIsPercent ?? false
  )
  const [basketCount, setBasketCount] = useState<string>(
    existing?.basketCount ? String(existing.basketCount) : ""
  )
  const [expenseRows, setExpenseRows] = useState<DraftExpense[]>(() => {
    if (existing?.expenseItems?.length) {
      return existing.expenseItems.map((e) => ({
        id: e.id,
        label: e.label,
        amount: String(e.amount),
      }))
    }
    if (existing?.expenses) {
      return [{ id: crypto.randomUUID(), label: "", amount: String(existing.expenses) }]
    }
    return []
  })
  const [items, setItems] = useState<DraftItem[]>(() =>
    existing && existing.items.length
      ? existing.items.map((it) => ({
          id: it.id,
          name: it.name,
          price: String(it.price),
        }))
      : [newDraftItem()]
  )

  const nameRefs = useRef<Map<string, HTMLInputElement | null>>(new Map())
  const priceRefs = useRef<Map<string, HTMLInputElement | null>>(new Map())
  const focusNameId = useRef<string | null>(null)

  useEffect(() => {
    if (focusNameId.current) {
      nameRefs.current.get(focusNameId.current)?.focus()
      focusNameId.current = null
    }
  }, [items])

  const totals = useMemo(
    () =>
      priceListTotals({
        items: items.map((it) => ({ price: Number(it.price) || 0 })),
        commission: Number(commission) || 0,
        commissionIsPercent,
        expenseItems: expenseRows.map((e) => ({ amount: Number(e.amount) || 0 })),
      }),
    [items, commission, commissionIsPercent, expenseRows]
  )

  const updateItem = (itemId: string, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)))
  }

  // Suggestions only ever fill the item name — the price is always typed by hand.
  const applySuggestion = (itemId: string, suggestion: CatalogItem) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, name: suggestion.name } : it))
    )
    requestAnimationFrame(() => priceRefs.current.get(itemId)?.focus())
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((it) => it.id !== itemId)))
  }

  const addItemRow = () => {
    const row = newDraftItem()
    focusNameId.current = row.id
    setItems((prev) => [...prev, row])
  }

  // Enter on the price field commits the row and jumps to a fresh one.
  const handlePriceEnter = (itemId: string) => {
    const isLast = items[items.length - 1]?.id === itemId
    if (isLast) {
      addItemRow()
    } else {
      const idx = items.findIndex((it) => it.id === itemId)
      const next = items[idx + 1]
      if (next) nameRefs.current.get(next.id)?.focus()
    }
  }

  const updateExpense = (rowId: string, patch: Partial<DraftExpense>) => {
    setExpenseRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))
  }
  const removeExpense = (rowId: string) => {
    setExpenseRows((prev) => prev.filter((r) => r.id !== rowId))
  }
  const addExpense = () => setExpenseRows((prev) => [...prev, newDraftExpense()])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validItems: PriceListItem[] = []
    for (const it of items) {
      const name = it.name.trim()
      const price = Number(it.price) || 0
      if (!name && price === 0) continue
      validItems.push({ id: it.id, name, price })
    }
    if (validItems.length === 0) {
      toast.error(t.pricelists.noItems)
      return
    }
    learnItems(validItems.filter((it) => it.name))
    const commissionVal = Number(commission) || 0
    const expenseItems = expenseRows
      .map((r) => ({
        id: r.id,
        label: r.label.trim(),
        amount: Number(r.amount) || 0,
      }))
      .filter((r) => r.label || r.amount)
    const basketVal = Number(basketCount) || 0
    const payload = {
      title: title.trim(),
      date,
      basketCount: basketVal || undefined,
      items: validItems,
      commission: commissionVal || undefined,
      commissionIsPercent: commissionVal ? commissionIsPercent : undefined,
      expenseItems: expenseItems.length ? expenseItems : undefined,
      expenses: undefined,
      notes: notes.trim() || undefined,
    }
    if (existing) {
      updatePriceList(existing.id, payload)
      toast.success(t.pricelists.saved)
      navigate(`/pricelists/${existing.id}`)
    } else {
      const created = addPriceList(payload)
      toast.success(t.pricelists.added)
      navigate(`/pricelists/${created.id}`)
    }
  }

  return (
    <>
      <PageHeader
        title={isEdit ? t.pricelists.editTitle : t.pricelists.newTitle}
        actions={
          <Button variant="ghost" asChild>
            <Link to="/pricelists">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t.actions.back}
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="title">{t.pricelists.titleLabel}</Label>
              <Input
                id="title"
                value={title}
                placeholder={t.pricelists.titlePlaceholder}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">{t.common.date}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="basketCount">{t.pricelists.baskets}</Label>
              <Input
                id="basketCount"
                type="text"
                inputMode="numeric"
                dir="ltr"
                placeholder="0"
                value={basketCount}
                onChange={(e) => setBasketCount(toLatinDigits(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <p className="text-muted-foreground text-xs">{t.pricelists.suggestionsHint}</p>
            <div className="text-muted-foreground hidden grid-cols-[2rem_1fr_140px_40px] gap-2 px-1 text-xs font-medium uppercase sm:grid">
              <div className="text-center">#</div>
              <div>{t.pricelists.item}</div>
              <div>{t.pricelists.price}</div>
              <div />
            </div>

            {items.map((item, idx) => (
              <ItemRow
                key={item.id}
                index={idx}
                item={item}
                suggestions={catalog}
                canRemove={items.length > 1}
                registerNameRef={(el) => nameRefs.current.set(item.id, el)}
                registerPriceRef={(el) => priceRefs.current.set(item.id, el)}
                onChange={(patch) => updateItem(item.id, patch)}
                onApplySuggestion={(s) => applySuggestion(item.id, s)}
                onPriceEnter={() => handlePriceEnter(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}

            <div>
              <Button type="button" variant="outline" onClick={addItemRow}>
                <Plus className="size-4" />
                {t.pricelists.addItem}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 sm:max-w-sm">
              <Label htmlFor="commission">{t.pricelists.commission}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="commission"
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  placeholder="0"
                  value={commission}
                  onChange={(e) => setCommission(toLatinDigits(e.target.value))}
                />
                <div className="bg-muted inline-flex shrink-0 rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={() => setCommissionIsPercent(false)}
                    className={
                      "rounded px-3 py-1 text-sm " +
                      (!commissionIsPercent ? "bg-background shadow-sm" : "text-muted-foreground")
                    }
                  >
                    {t.pricelists.flatAmount}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommissionIsPercent(true)}
                    className={
                      "rounded px-3 py-1 text-sm " +
                      (commissionIsPercent ? "bg-background shadow-sm" : "text-muted-foreground")
                    }
                  >
                    {t.pricelists.percent}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{t.pricelists.expenses}</Label>
              {expenseRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_120px_40px] items-center gap-2"
                >
                  <Input
                    value={row.label}
                    placeholder={t.pricelists.expenseNamePlaceholder}
                    onChange={(e) => updateExpense(row.id, { label: e.target.value })}
                  />
                  <Input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    placeholder="0"
                    value={row.amount}
                    onChange={(e) =>
                      updateExpense(row.id, { amount: toLatinDigits(e.target.value) })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExpense(row.id)}
                    aria-label={t.actions.remove}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <div>
                <Button type="button" variant="outline" size="sm" onClick={addExpense}>
                  <Plus className="size-4" />
                  {t.pricelists.addExpense}
                </Button>
              </div>
            </div>

            <div className="grid gap-2 border-t pt-4 text-sm">
              <TotalRow
                label={t.pricelists.subtotal}
                value={formatAmount(totals.subtotal)}
              />
              {totals.commission ? (
                <TotalRow
                  label={
                    commissionIsPercent
                      ? `${t.pricelists.commission} (${commission}${t.pricelists.percent})`
                      : t.pricelists.commission
                  }
                  value={`− ${formatAmount(totals.commission)}`}
                />
              ) : null}
              {totals.expenses ? (
                <>
                  <TotalRow
                    label={t.pricelists.expenses}
                    value={`− ${formatAmount(totals.expenses)}`}
                  />
                  {expenseRows
                    .filter((r) => r.label.trim() || Number(r.amount))
                    .map((r) => (
                      <div
                        key={r.id}
                        className="text-muted-foreground flex items-center justify-between ps-4 text-xs"
                      >
                        <span>{r.label.trim() || t.pricelists.expenses}</span>
                        <span dir="ltr" className="tabular-nums">
                          {formatAmount(Number(r.amount) || 0)}
                        </span>
                      </div>
                    ))}
                </>
              ) : null}
              <div className="mt-1 flex items-center justify-between border-t pt-3">
                <span className="text-muted-foreground text-xs uppercase">
                  {t.pricelists.grandTotal}
                </span>
                <span className="text-2xl font-semibold tabular-nums">
                  {formatMoney(totals.grandTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <Label htmlFor="notes">{t.common.notes}</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            {t.actions.cancel}
          </Button>
          <Button type="submit">{isEdit ? t.actions.save : t.actions.create}</Button>
        </div>
      </form>
    </>
  )
}

type ItemRowProps = {
  index: number
  item: DraftItem
  suggestions: CatalogItem[]
  canRemove: boolean
  registerNameRef: (el: HTMLInputElement | null) => void
  registerPriceRef: (el: HTMLInputElement | null) => void
  onChange: (patch: Partial<DraftItem>) => void
  onApplySuggestion: (s: CatalogItem) => void
  onPriceEnter: () => void
  onRemove: () => void
}

function ItemRow({
  index,
  item,
  suggestions,
  canRemove,
  registerNameRef,
  registerPriceRef,
  onChange,
  onApplySuggestion,
  onPriceEnter,
  onRemove,
}: ItemRowProps) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const priceRef = useRef<HTMLInputElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(
    null
  )

  const query = item.name.trim().toLowerCase()
  const matches = useMemo(() => {
    if (!query) return []
    return suggestions
      .filter((s) => s.name.toLowerCase().includes(query) && s.name.toLowerCase() !== query)
      .slice(0, 8)
  }, [suggestions, query])

  const showMenu = open && matches.length > 0

  // The dropdown is rendered in a portal with fixed positioning so it can't be
  // clipped by the Card's `overflow-hidden`. Keep it aligned to the input.
  useLayoutEffect(() => {
    if (!showMenu) return
    const reposition = () => {
      const el = nameRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setMenuRect({ left: r.left, top: r.bottom + 4, width: r.width })
    }
    reposition()
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)
    return () => {
      window.removeEventListener("scroll", reposition, true)
      window.removeEventListener("resize", reposition)
    }
  }, [showMenu])

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMenu && e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => (a + 1) % matches.length)
    } else if (showMenu && e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a - 1 + matches.length) % matches.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (showMenu) {
        onApplySuggestion(matches[active])
        setOpen(false)
      } else {
        priceRef.current?.focus()
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[2rem_1fr_140px_40px] sm:items-center">
      <div className="text-muted-foreground hidden text-center text-sm tabular-nums sm:block">
        {index + 1}
      </div>
      <div>
        <Input
          ref={(el) => {
            nameRef.current = el
            registerNameRef(el)
          }}
          value={item.name}
          placeholder={t.pricelists.itemPlaceholder}
          autoComplete="off"
          onChange={(e) => {
            onChange({ name: e.target.value })
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleNameKeyDown}
        />
        {showMenu && menuRect
          ? createPortal(
              <ul
                className="bg-popover text-popover-foreground fixed z-[100] max-h-60 overflow-y-auto overflow-x-hidden rounded-md border shadow-md"
                style={{ left: menuRect.left, top: menuRect.top, width: menuRect.width }}
              >
                {matches.map((s, i) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={
                        "flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm " +
                        (i === active
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50")
                      }
                      onMouseDown={(e) => {
                        e.preventDefault()
                        onApplySuggestion(s)
                        setOpen(false)
                      }}
                      onMouseEnter={() => setActive(i)}
                    >
                      <span className="truncate">{s.name}</span>
                    </button>
                  </li>
                ))}
              </ul>,
              document.body
            )
          : null}
      </div>
      <Input
        ref={(el) => {
          priceRef.current = el
          registerPriceRef(el)
        }}
        type="text"
        inputMode="decimal"
        dir="ltr"
        placeholder={t.pricelists.price}
        value={item.price}
        onChange={(e) => onChange({ price: toLatinDigits(e.target.value) })}
        onBlur={() => onChange({ price: snapPriceInput(item.price) })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onPriceEnter()
          }
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={t.actions.remove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span dir="ltr" className="tabular-nums">
        {value}
      </span>
    </div>
  )
}
