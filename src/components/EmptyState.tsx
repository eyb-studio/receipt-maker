import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type EmptyStateProps = {
  icon: LucideIcon
  message: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <div className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-full">
        <Icon className="size-6" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
      {action}
    </div>
  )
}
