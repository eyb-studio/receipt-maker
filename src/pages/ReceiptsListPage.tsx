import { Link } from "react-router-dom"
import { Plus, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useReceipts } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"

export function ReceiptsListPage() {
  const t = useT()
  const { receipts } = useReceipts()

  return (
    <>
      <PageHeader
        title={t.receipts.title}
        actions={
          <Button asChild>
            <Link to="/receipts/new">
              <Plus className="size-4" />
              {t.actions.newReceipt}
            </Link>
          </Button>
        }
      />

      {receipts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          message={t.receipts.empty}
          action={
            <Button asChild variant="outline">
              <Link to="/receipts/new">
                <Plus className="size-4" />
                {t.actions.newReceipt}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {receipts.map((r) => {
            const totalQty = r.items.reduce((s, it) => s + it.quantity, 0)
            const totalWeight = Number(
              r.items.reduce((s, it) => s + it.quantity * it.weight, 0).toFixed(3)
            )
            const dateStr = (() => {
              try {
                return new Date(r.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              } catch {
                return r.date
              }
            })()
            return (
              <Link key={r.id} to={`/receipts/${r.id}`} className="block">
                <Card className="hover:bg-accent/30 transition-colors">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="tabular-nums">
                          #{r.number}
                        </Badge>
                        <span className="font-medium">
                          {r.clientName || t.receipts.noClient}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">{dateStr}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Stat label={t.receipts.itemCount} value={r.items.length} />
                      <Stat label={t.receipts.totalQuantity} value={totalQty} />
                      <Stat label={t.receipts.totalWeight} value={totalWeight} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  const display = Number.isInteger(value) ? value : Number(value.toFixed(2))
  return (
    <div className="text-end">
      <div className="text-muted-foreground text-xs uppercase">{label}</div>
      <div className="text-base font-semibold tabular-nums">{display}</div>
    </div>
  )
}
