import { useState } from "react"
import { Pencil, Plus, Trash2, Users } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useClients } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { toLatinDigits } from "@/lib/digits"
import type { Client } from "@/types"

export function ClientsPage() {
  const t = useT()
  const { clients, addClient, updateClient, deleteClient } = useClients()
  const [editing, setEditing] = useState<Client | null>(null)
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Client | null>(null)

  const openCreate = () => {
    setEditing(null)
    setOpen(true)
  }
  const openEdit = (client: Client) => {
    setEditing(client)
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get("name") ?? "").trim()
    if (!name) return
    const data = {
      name,
      phone: toLatinDigits(String(fd.get("phone") ?? "")).trim() || undefined,
      address: String(fd.get("address") ?? "").trim() || undefined,
    }
    if (editing) {
      updateClient(editing.id, data)
      toast.success(t.common.updated)
    } else {
      addClient(data)
      toast.success(t.common.created)
    }
    setOpen(false)
    setEditing(null)
  }

  return (
    <>
      <PageHeader
        title={t.clients.title}
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t.actions.new}
          </Button>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          message={t.clients.empty}
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" />
              {t.actions.add}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{client.name}</div>
                  {client.phone ? (
                    <div className="text-muted-foreground truncate text-sm" dir="ltr">
                      {client.phone}
                    </div>
                  ) : null}
                  {client.address ? (
                    <div className="text-muted-foreground truncate text-sm">{client.address}</div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(client)} aria-label={t.actions.edit}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(client)}
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
            <DialogTitle>{editing ? t.clients.editTitle : t.clients.newTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t.common.name}</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder={t.clients.namePlaceholder}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t.common.phone}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                dir="ltr"
                defaultValue={editing?.phone ?? ""}
                placeholder={t.clients.phonePlaceholder}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">{t.common.address}</Label>
              <Textarea
                id="address"
                name="address"
                rows={2}
                defaultValue={editing?.address ?? ""}
                placeholder={t.clients.addressPlaceholder}
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
        title={t.clients.deleteConfirm}
        description={toDelete?.name}
        destructive
        onConfirm={() => {
          if (toDelete) {
            deleteClient(toDelete.id)
            toast.success(t.common.deleted)
          }
        }}
      />
    </>
  )
}
