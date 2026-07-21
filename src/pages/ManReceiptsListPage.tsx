import { Link } from "react-router-dom"
import { ListChecks, Plus, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useManReceipts } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { formatMoney, formatTotalWeight, manReceiptTotals } from "@/lib/formatters"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"

export function ManReceiptsListPage() {
  const t = useT()
  const { manReceipts } = useManReceipts()

  return (
    <>
      <PageHeader
        title={t.manreceipts.title}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/manreceipts/catalog">
                <ListChecks className="size-4" />
                {t.pricelists.manageItems}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/manreceipts/new">
                <Plus className="size-4" />
                {t.manreceipts.newAction}
              </Link>
            </Button>
          </div>
        }
      />

      {manReceipts.length === 0 ? (
        <EmptyState
          icon={Scale}
          message={t.manreceipts.empty}
          action={
            <Button asChild variant="outline">
              <Link to="/manreceipts/new">
                <Plus className="size-4" />
                {t.manreceipts.newAction}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {manReceipts.map((m) => {
            const totals = manReceiptTotals(m)
            const dateStr = (() => {
              try {
                return new Date(m.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              } catch {
                return m.date
              }
            })()
            return (
              <Link key={m.id} to={`/manreceipts/${m.id}`} className="block">
                <Card className="hover:bg-accent/30 transition-colors">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="tabular-nums">
                          #{m.number}
                        </Badge>
                        <span className="font-medium">{m.title || `#${m.number}`}</span>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">{dateStr}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Stat label={t.pricelists.itemCount} value={String(m.items.length)} />
                      <Stat
                        label={t.manreceipts.totalWeight}
                        value={formatTotalWeight(totals.totalWeight)}
                      />
                      <Stat
                        label={t.pricelists.grandTotal}
                        value={formatMoney(totals.grandTotal)}
                      />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-end">
      <div className="text-muted-foreground text-xs uppercase">{label}</div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
    </div>
  )
}
