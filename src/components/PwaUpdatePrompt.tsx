import { useEffect, useRef } from "react"
import { useRegisterSW } from "virtual:pwa-register/react"
import { toast } from "sonner"
import { useT } from "@/i18n/LanguageProvider"

export function PwaUpdatePrompt() {
  const t = useT()
  const updateToastId = useRef<string | number | null>(null)
  const offlineToastId = useRef<string | number | null>(null)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("SW registration failed", error)
    },
  })

  useEffect(() => {
    if (!needRefresh) return
    updateToastId.current = toast.info(t.pwa.updateAvailable, {
      duration: Infinity,
      action: {
        label: t.pwa.reload,
        onClick: () => {
          void updateServiceWorker(true)
        },
      },
      onDismiss: () => setNeedRefresh(false),
    })
    return () => {
      if (updateToastId.current !== null) toast.dismiss(updateToastId.current)
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker, t])

  useEffect(() => {
    if (!offlineReady) return
    offlineToastId.current = toast.success(t.pwa.offlineReady, {
      duration: 4000,
      onAutoClose: () => setOfflineReady(false),
      onDismiss: () => setOfflineReady(false),
    })
    return () => {
      if (offlineToastId.current !== null) toast.dismiss(offlineToastId.current)
    }
  }, [offlineReady, setOfflineReady, t])

  return null
}
