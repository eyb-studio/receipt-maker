import { Link } from "react-router-dom"
import { ListChecks, Plus, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePriceLists } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { formatMoney } from "@/lib/formatters"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"

export function PriceListsListPage() {
  const t = useT()
  const { priceLists } = usePriceLists()

  return (
    <>
      <PageHeader
        title={t.pricelists.title}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/pricelists/catalog">
                <ListChecks className="size-4" />
                {t.pricelists.manageItems}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/pricelists/new">
                <Plus className="size-4" />
                {t.pricelists.newAction}
              </Link>
            </Button>
          </div>
        }
      />

      {priceLists.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          message={t.pricelists.empty}
          action={
            <Button asChild variant="outline">
              <Link to="/pricelists/new">
                <Plus className="size-4" />
                {t.pricelists.newAction}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {priceLists.map((p) => {
            const total = p.items.reduce((s, it) => s + it.price, 0)
            const dateStr = (() => {
              try {
                return new Date(p.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              } catch {
                return p.date
              }
            })()
            return (
              <Link key={p.id} to={`/pricelists/${p.id}`} className="block">
                <Card className="hover:bg-accent/30 transition-colors">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="tabular-nums">
                          #{p.number}
                        </Badge>
                        <span className="font-medium">{p.title || `#${p.number}`}</span>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">{dateStr}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Stat label={t.pricelists.itemCount} value={String(p.items.length)} />
                      <Stat label={t.pricelists.grandTotal} value={formatMoney(total)} />
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
