import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useLedgers } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { PageHeader } from "@/components/PageHeader"
import { toLatinDigits } from "@/lib/digits"
import { formatAmount, formatMoney } from "@/lib/formatters"
import type { LedgerRow } from "@/types"

type DraftRow = {
  id: string
  name: string
  date: string
  invoice: string
  commission: string
  cash: string
}

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function newDraftRow(): DraftRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    date: todayISO(),
    invoice: "",
    commission: "",
    cash: "",
  }
}

function draftBalance(row: DraftRow): number {
  return (
    (Number(row.invoice) || 0) +
    (Number(row.commission) || 0) -
    (Number(row.cash) || 0)
  )
}

export function LedgerEditorPage() {
  const t = useT()
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { ledgers, addLedger, updateLedger } = useLedgers()

  const existing = id ? ledgers.find((l) => l.id === id) : undefined
  const isEdit = Boolean(existing)

  const [title, setTitle] = useState<string>(existing?.title ?? "")
  const [date, setDate] = useState<string>(existing?.date ?? todayISO())
  const [notes, setNotes] = useState<string>(existing?.notes ?? "")
  const [rows, setRows] = useState<DraftRow[]>(() =>
    existing
      ? existing.rows.map((r) => ({
          id: r.id,
          name: r.name,
          date: r.date ?? "",
          invoice: String(r.invoice),
          commission: String(r.commission),
          cash: String(r.cash),
        }))
      : [newDraftRow()]
  )

  // مانده is a running balance: each row carries the previous rows forward.
  const cumulativeBalances = useMemo(() => {
    let acc = 0
    return rows.map((r) => (acc += draftBalance(r)))
  }, [rows])
  const grandTotal = cumulativeBalances[cumulativeBalances.length - 1] ?? 0

  const updateRow = (rowId: string, patch: Partial<DraftRow>) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))
  }
  const removeRow = (rowId: string) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== rowId)))
  }
  const addRow = () => setRows((prev) => [...prev, newDraftRow()])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validRows: LedgerRow[] = []
    for (const r of rows) {
      const invoice = Number(r.invoice) || 0
      const commission = Number(r.commission) || 0
      const cash = Number(r.cash) || 0
      if (!r.name.trim() && invoice === 0 && commission === 0 && cash === 0) continue
      validRows.push({
        id: r.id,
        name: r.name.trim(),
        date: r.date || undefined,
        invoice,
        commission,
        cash,
      })
    }
    if (validRows.length === 0) {
      toast.error(t.ledgers.noRows)
      return
    }
    const payload = {
      title: title.trim(),
      date,
      rows: validRows,
      notes: notes.trim() || undefined,
    }
    if (existing) {
      updateLedger(existing.id, payload)
      toast.success(t.ledgers.saved)
      navigate(`/ledgers/${existing.id}`)
    } else {
      const created = addLedger(payload)
      toast.success(t.ledgers.added)
      navigate(`/ledgers/${created.id}`)
    }
  }

  return (
    <>
      <PageHeader
        title={isEdit ? t.ledgers.editTitle : t.ledgers.newTitle}
        actions={
          <Button variant="ghost" asChild>
            <Link to="/ledgers">
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
              <Label htmlFor="title">{t.ledgers.titleLabel}</Label>
              <Input
                id="title"
                value={title}
                placeholder={t.ledgers.titlePlaceholder}
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-3">
            <div className="text-muted-foreground hidden grid-cols-[1fr_150px_110px_110px_110px_110px_40px] gap-2 text-xs font-medium uppercase sm:grid">
              <div>{t.ledgers.name}</div>
              <div>{t.common.date}</div>
              <div>{t.ledgers.invoice}</div>
              <div>{t.ledgers.commission}</div>
              <div>{t.ledgers.cash}</div>
              <div>{t.ledgers.balance}</div>
              <div />
            </div>

            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="grid gap-2 sm:grid-cols-[1fr_150px_110px_110px_110px_110px_40px] sm:items-center"
              >
                <Input
                  value={row.name}
                  placeholder={t.ledgers.namePlaceholder}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                />
                <Input
                  type="date"
                  value={row.date}
                  aria-label={t.common.date}
                  onChange={(e) => updateRow(row.id, { date: e.target.value })}
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  placeholder={t.ledgers.invoice}
                  value={row.invoice}
                  onChange={(e) =>
                    updateRow(row.id, { invoice: toLatinDigits(e.target.value) })
                  }
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  placeholder={t.ledgers.commission}
                  value={row.commission}
                  onChange={(e) =>
                    updateRow(row.id, { commission: toLatinDigits(e.target.value) })
                  }
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  placeholder={t.ledgers.cash}
                  value={row.cash}
                  onChange={(e) =>
                    updateRow(row.id, { cash: toLatinDigits(e.target.value) })
                  }
                />
                <div
                  dir="ltr"
                  className="bg-muted/40 text-foreground flex h-9 items-center justify-end rounded-md border px-3 text-sm tabular-nums"
                  aria-label={t.ledgers.balance}
                >
                  {formatAmount(cumulativeBalances[idx])}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  aria-label={t.actions.remove}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <div>
              <Button type="button" variant="outline" onClick={addRow}>
                <Plus className="size-4" />
                {t.ledgers.addRow}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Stat label={t.ledgers.rowCount} value={String(rows.filter((r) => r.name.trim()).length)} />
            <Stat label={t.ledgers.grandTotal} value={formatMoney(grandTotal)} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-md p-3">
      <div className="text-muted-foreground text-xs uppercase">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}
