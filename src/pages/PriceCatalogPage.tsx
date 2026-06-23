import { useState } from "react"
import { ArrowLeft, ListChecks, Pencil, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
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
import { usePriceCatalog } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { toLatinDigits } from "@/lib/digits"
import { formatAmount } from "@/lib/formatters"
import type { CatalogItem } from "@/types"

export function PriceCatalogPage() {
  const t = useT()
  const { catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem } = usePriceCatalog()
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState<CatalogItem | null>(null)

  const openCreate = () => {
    setEditing(null)
    setOpen(true)
  }
  const openEdit = (item: CatalogItem) => {
    setEditing(item)
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get("name") ?? "").trim()
    const price = Number(toLatinDigits(String(fd.get("price") ?? ""))) || 0
    if (!name) return
    if (editing) {
      updateCatalogItem(editing.id, { name, price })
      toast.success(t.common.updated)
    } else {
      addCatalogItem({ name, price })
      toast.success(t.common.created)
    }
    setOpen(false)
    setEditing(null)
  }

  return (
    <>
      <PageHeader
        title={t.pricelists.catalogTitle}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/pricelists">
                <ArrowLeft className="size-4 rtl:rotate-180" />
                {t.actions.back}
              </Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              {t.actions.new}
            </Button>
          </div>
        }
      />

      {catalog.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          message={t.pricelists.catalogEmpty}
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" />
              {t.actions.add}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="text-muted-foreground truncate text-sm tabular-nums" dir="ltr">
                    {formatAmount(item.price)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(item)}
                    aria-label={t.actions.edit}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(item)}
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
            <DialogTitle>
              {editing ? t.pricelists.editItem : t.pricelists.newItem}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t.pricelists.item}</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder={t.pricelists.itemPlaceholder}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">{t.pricelists.defaultPrice}</Label>
              <Input
                id="price"
                name="price"
                type="text"
                inputMode="decimal"
                dir="ltr"
                defaultValue={editing?.price ? String(editing.price) : ""}
                placeholder="0"
                onChange={(e) => {
                  e.target.value = toLatinDigits(e.target.value)
                }}
              />
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
        title={t.pricelists.catalogDeleteConfirm}
        description={toDelete?.name}
        destructive
        onConfirm={() => {
          if (toDelete) {
            deleteCatalogItem(toDelete.id)
            toast.success(t.common.deleted)
          }
        }}
      />
    </>
  )
}
