import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useClients, useProducts, useReceipts } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { PageHeader } from "@/components/PageHeader"
import { NumberStepper } from "@/components/NumberStepper"
import { toLatinDigits } from "@/lib/digits"
import { formatTotalWeight, formatUnitWeight } from "@/lib/formatters"
import type { ReceiptItem } from "@/types"

type DraftItem = {
  id: string
  productId: string
  quantity: string
  weight: string
}

function newDraftItem(): DraftItem {
  return {
    id: crypto.randomUUID(),
    productId: "",
    quantity: "",
    weight: "",
  }
}

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function ReceiptEditorPage() {
  const t = useT()
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { clients } = useClients()
  const { products } = useProducts()
  const { receipts, addReceipt, updateReceipt } = useReceipts()

  const existing = id ? receipts.find((r) => r.id === id) : undefined
  const isEdit = Boolean(existing)

  const [clientId, setClientId] = useState<string>(existing?.clientId ?? "")
  const [date, setDate] = useState<string>(existing?.date ?? todayISO())
  const [notes, setNotes] = useState<string>(existing?.notes ?? "")
  const [items, setItems] = useState<DraftItem[]>(() =>
    existing
      ? existing.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          quantity: String(it.quantity),
          weight: String(it.weight),
        }))
      : [newDraftItem()]
  )

  const totals = useMemo(() => {
    let qty = 0
    let kg = 0
    for (const it of items) {
      const q = Number(it.quantity) || 0
      const w = Number(it.weight) || 0
      qty += q
      kg += q * w
    }
    return { qty, kg }
  }, [items])

  const updateItem = (id: string, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  const setItemQuantity = (id: string, quantity: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity } : it)))
  }
  const setItemProduct = (id: string, productId: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const product = products.find((p) => p.id === productId)
        const unitValue = product?.unitWeight ?? 0
        const weight = unitValue > 0 ? String(unitValue) : it.weight
        return { ...it, productId, weight }
      })
    )
  }
  const removeItem = (id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((it) => it.id !== id)))
  }
  const addItem = () => setItems((prev) => [...prev, newDraftItem()])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validItems: ReceiptItem[] = []
    for (const it of items) {
      if (!it.productId) continue
      const product = products.find((p) => p.id === it.productId)
      if (!product) continue
      const q = Number(it.quantity) || 0
      const w = Number(it.weight) || 0
      if (q === 0 && w === 0) continue
      validItems.push({
        id: it.id,
        productId: product.id,
        productName: product.name,
        colorName: product.colorName,
        colorHex: product.colorHex,
        unitWeight: product.unitWeight ?? 0,
        quantity: q,
        weight: w,
      })
    }
    if (validItems.length === 0) {
      toast.error(t.receipts.noProducts)
      return
    }
    const client = clients.find((c) => c.id === clientId) ?? null
    const payload = {
      clientId: client?.id ?? null,
      clientName: client?.name ?? null,
      date,
      items: validItems,
      notes: notes.trim() || undefined,
    }
    if (existing) {
      updateReceipt(existing.id, payload)
      toast.success(t.receipts.saved)
      navigate(`/receipts/${existing.id}`)
    } else {
      const created = addReceipt(payload)
      toast.success(t.receipts.added)
      navigate(`/receipts/${created.id}`)
    }
  }

  return (
    <>
      <PageHeader
        title={isEdit ? t.receipts.editTitle : t.receipts.newTitle}
        actions={
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t.actions.back}
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t.receipts.client}</Label>
              {clients.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t.receipts.noClients}.{" "}
                  <Link to="/clients" className="underline">
                    {t.actions.add}
                  </Link>
                </p>
              ) : (
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.receipts.selectClient} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-3">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t.receipts.noProducts}.{" "}
                <Link to="/products" className="underline">
                  {t.actions.add}
                </Link>
              </p>
            ) : (
              <>
                <div className="text-muted-foreground hidden grid-cols-[1fr_120px_120px_120px_40px] gap-2 text-xs font-medium uppercase sm:grid">
                  <div>{t.receipts.product}</div>
                  <div>{t.receipts.quantity}</div>
                  <div>{t.receipts.weight}</div>
                  <div>{t.receipts.totalWeightCol}</div>
                  <div />
                </div>

                {items.map((item) => {
                  const product = products.find((p) => p.id === item.productId)
                  const rowSum = (Number(item.quantity) || 0) * (Number(item.weight) || 0)
                  return (
                    <div
                      key={item.id}
                      className="grid gap-2 sm:grid-cols-[1fr_120px_120px_120px_40px] sm:items-center"
                    >
                      <Select
                        value={item.productId}
                        onValueChange={(v) => setItemProduct(item.id, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.receipts.selectProduct}>
                            {product ? (
                              <span className="flex items-center gap-2">
                                <span
                                  className="size-3 rounded-full border"
                                  style={{ background: product.colorHex }}
                                />
                                <span>{product.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  · {product.colorName}
                                </span>
                              </span>
                            ) : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="size-3 rounded-full border"
                                  style={{ background: p.colorHex }}
                                />
                                <span>{p.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  · {p.colorName}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <NumberStepper
                        value={item.quantity}
                        placeholder={t.receipts.quantity}
                        ariaLabel={t.receipts.quantity}
                        onChange={(v) => setItemQuantity(item.id, v)}
                      />
                      <div className="relative" dir="ltr">
                        <Input
                          type="text"
                          inputMode="decimal"
                          dir="ltr"
                          className="pr-9"
                          placeholder={t.receipts.weight}
                          value={item.weight}
                          onChange={(e) =>
                            updateItem(item.id, { weight: toLatinDigits(e.target.value) })
                          }
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                          kg
                        </span>
                      </div>
                      <div
                        dir="ltr"
                        className="bg-muted/40 text-muted-foreground flex h-9 items-center justify-between rounded-md border px-3 text-sm tabular-nums"
                        aria-label={t.receipts.totalWeightCol}
                      >
                        <span className="text-foreground">{formatUnitWeight(rowSum)}</span>
                        <span className="text-xs">kg</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        aria-label={t.actions.remove}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )
                })}

                <div>
                  <Button type="button" variant="outline" onClick={addItem}>
                    <Plus className="size-4" />
                    {t.actions.addItem}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Stat label={t.receipts.itemCount} value={String(items.filter((i) => i.productId).length)} />
            <Stat label={t.receipts.totalQuantity} value={String(totals.qty)} />
            <Stat label={t.receipts.totalWeight} value={formatTotalWeight(totals.kg)} />
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
          <Button type="submit" disabled={products.length === 0}>
            {isEdit ? t.actions.save : t.actions.create}
          </Button>
        </div>
      </form>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  const display = value
  return (
    <div className="bg-muted/40 rounded-md p-3">
      <div className="text-muted-foreground text-xs uppercase">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{display}</div>
    </div>
  )
}
