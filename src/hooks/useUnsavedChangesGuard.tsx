import { useEffect } from "react"
import { useBlocker } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/LanguageProvider"

export function useUnsavedChangesGuard(when: boolean) {
  useEffect(() => {
    if (!when) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [when])

  const blocker = useBlocker(when)

  return blocker
}

type UnsavedChangesPromptProps = {
  blocker: ReturnType<typeof useBlocker>
  title: string
  description: string
  discardLabel: string
}

export function UnsavedChangesPrompt({
  blocker,
  title,
  description,
  discardLabel,
}: UnsavedChangesPromptProps) {
  const t = useT()
  const open = blocker.state === "blocked"

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) blocker.reset?.()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => blocker.reset?.()}>
            {t.actions.cancel}
          </Button>
          <Button variant="destructive" onClick={() => blocker.proceed?.()}>
            {discardLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
