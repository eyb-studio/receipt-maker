import { useState } from "react"
import { Package, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useProducts } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toLatinDigits } from "@/lib/digits"
import { formatUnitWeight } from "@/lib/formatters"
import type { Product, WeightUnit } from "@/types"

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#78716c",
  "#1f2937",
]

export function ProductsPage() {
  const t = useT()
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const [editing, setEditing] = useState<Product | null>(null)
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Product | null>(null)
  const [color, setColor] = useState("#8b5cf6")
  const [unit, setUnit] = useState<WeightUnit>("g")

  const openCreate = () => {
    setEditing(null)
    setColor("#8b5cf6")
    setUnit("g")
    setOpen(true)
  }
  const openEdit = (product: Product) => {
    setEditing(product)
    setColor(product.colorHex)
    setUnit(product.unitWeightUnit ?? "g")
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get("name") ?? "").trim()
    const colorName = String(fd.get("colorName") ?? "").trim()
    const unitWeight = Number(toLatinDigits(String(fd.get("unitWeight") ?? ""))) || 0
    if (!name || !colorName) return
    const data = { name, colorName, colorHex: color, unitWeight, unitWeightUnit: unit }
    if (editing) {
      updateProduct(editing.id, data)
      toast.success(t.common.updated)
    } else {
      addProduct(data)
      toast.success(t.common.created)
    }
    setOpen(false)
    setEditing(null)
  }

  return (
    <>
      <PageHeader
        title={t.products.title}
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t.actions.new}
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          message={t.products.empty}
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" />
              {t.actions.add}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="size-8 shrink-0 rounded-full border"
                    style={{ background: product.colorHex }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{product.name}</div>
                    <div className="text-muted-foreground truncate text-sm">
                      {product.colorName}
                      {(product.unitWeight ?? 0) > 0
                        ? ` · ${formatUnitWeight(product.unitWeight, product.unitWeightUnit ?? "g")}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(product)} aria-label={t.actions.edit}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(product)}
                    aria-label={t.actions.delete}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t.products.editTitle : t.products.newTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t.common.name}</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder={t.products.namePlaceholder}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="colorName">{t.products.colorName}</Label>
              <Input
                id="colorName"
                name="colorName"
                required
                defaultValue={editing?.colorName ?? ""}
                placeholder={t.products.colorNamePlaceholder}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unitWeight">{t.products.unitWeight}</Label>
              <div className="grid grid-cols-[1fr_110px] gap-2">
                <Input
                  id="unitWeight"
                  name="unitWeight"
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  defaultValue={editing?.unitWeight ? String(editing.unitWeight) : ""}
                  placeholder="0"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[۰-۹٠-٩]/g, (d) =>
                      String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(d) % 10)
                    )
                  }}
                />
                <Select value={unit} onValueChange={(v) => setUnit(v as WeightUnit)}>
                  <SelectTrigger aria-label={t.products.unit}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-muted-foreground text-xs">{t.products.unitWeightHint}</p>
            </div>
            <div className="grid gap-2">
              <Label>{t.products.pickColor}</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={
                      "size-8 rounded-full border-2 transition-transform " +
                      (color === c ? "scale-110 border-foreground" : "border-transparent hover:scale-105")
                    }
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
                <label
                  className="border-input hover:border-foreground relative size-8 cursor-pointer overflow-hidden rounded-full border-2"
                  style={{ background: color }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.actions.cancel}
              </Button>
              <Button type="submit">{editing ? t.actions.save : t.actions.create}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t.products.deleteConfirm}
        description={toDelete?.name}
        destructive
        onConfirm={() => {
          if (toDelete) {
            deleteProduct(toDelete.id)
            toast.success(t.common.deleted)
          }
        }}
      />
    </>
  )
}
