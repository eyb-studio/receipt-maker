import { Link } from "react-router-dom"
import { ClipboardList, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLedgers } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { formatMoney, rowBalance } from "@/lib/formatters"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"

export function LedgersListPage() {
  const t = useT()
  const { ledgers } = useLedgers()

  return (
    <>
      <PageHeader
        title={t.ledgers.title}
        actions={
          <Button asChild>
            <Link to="/ledgers/new">
              <Plus className="size-4" />
              {t.ledgers.newAction}
            </Link>
          </Button>
        }
      />

      {ledgers.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          message={t.ledgers.empty}
          action={
            <Button asChild variant="outline">
              <Link to="/ledgers/new">
                <Plus className="size-4" />
                {t.ledgers.newAction}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {ledgers.map((l) => {
            const grandTotal = l.rows.reduce((s, r) => s + rowBalance(r), 0)
            const dateStr = (() => {
              try {
                return new Date(l.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              } catch {
                return l.date
              }
            })()
            return (
              <Link key={l.id} to={`/ledgers/${l.id}`} className="block">
                <Card className="hover:bg-accent/30 transition-colors">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="tabular-nums">
                          #{l.number}
                        </Badge>
                        <span className="font-medium">
                          {l.title || `#${l.number}`}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">{dateStr}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Stat label={t.ledgers.rowCount} value={String(l.rows.length)} />
                      <Stat label={t.ledgers.grandTotal} value={formatMoney(grandTotal)} />
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
