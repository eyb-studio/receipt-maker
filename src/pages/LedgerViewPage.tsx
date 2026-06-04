import { useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, FileText, Image as ImageIcon, Pencil, Printer, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useCompany, useLedgers } from "@/lib/storage"
import { useT } from "@/i18n/LanguageProvider"
import { LedgerTemplate } from "@/components/receipt/LedgerTemplate"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { exportAsImage, exportAsPdf } from "@/lib/exporters"

export function LedgerViewPage() {
  const t = useT()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ledgers, deleteLedger } = useLedgers()
  const { company } = useCompany()
  const ledger = ledgers.find((l) => l.id === id)
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!ledger) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Account sheet not found</p>
        <Button asChild className="mt-4">
          <Link to="/ledgers">{t.actions.back}</Link>
        </Button>
      </div>
    )
  }

  const filename = `ledger-${ledger.number}`

  const handleExportImage = async () => {
    if (!ref.current) return
    setBusy(true)
    try {
      await exportAsImage(ref.current, filename)
    } catch (err) {
      console.error(err)
      toast.error(String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleExportPdf = async () => {
    if (!ref.current) return
    setBusy(true)
    try {
      await exportAsPdf(ref.current, filename)
    } catch (err) {
      console.error(err)
      toast.error(String(err))
    } finally {
      setBusy(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" asChild>
          <Link to="/ledgers">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t.actions.back}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={busy}>
            <Printer className="size-4" />
            {t.actions.print}
          </Button>
          <Button variant="outline" onClick={handleExportImage} disabled={busy}>
            <ImageIcon className="size-4" />
            {t.actions.exportImage}
          </Button>
          <Button onClick={handleExportPdf} disabled={busy}>
            <FileText className="size-4" />
            {t.actions.exportPdf}
          </Button>
          <Button variant="outline" size="icon" asChild aria-label={t.actions.edit}>
            <Link to={`/ledgers/${ledger.id}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setConfirmDelete(true)}
            aria-label={t.actions.delete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-neutral-100 p-4 sm:p-8 dark:bg-neutral-900 print:overflow-visible print:border-0 print:bg-transparent print:p-0">
        <div className="mx-auto w-fit rounded-md shadow-lg print:shadow-none">
          <LedgerTemplate ref={ref} ledger={ledger} company={company} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t.ledgers.deleteConfirm}
        destructive
        onConfirm={() => {
          deleteLedger(ledger.id)
          toast.success(t.common.deleted)
          navigate("/ledgers")
        }}
      />
    </>
  )
}
