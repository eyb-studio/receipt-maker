import { ArrowDown, ArrowUp, ArrowUpToLine, ArrowDownToLine, Copy, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useT } from "@/i18n/LanguageProvider"

type RowActionsProps = {
  /** Position of this row in the list, 0-based. */
  index: number
  /** How many rows the list currently holds. */
  count: number
  /** The last remaining row can't be deleted. */
  canRemove: boolean
  onInsertAbove: () => void
  onInsertBelow: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

/**
 * Per-row menu that lets rows be added, reordered or removed anywhere in the
 * list — the spreadsheet-style "insert row above/below" behaviour.
 */
export function RowActions({
  index,
  count,
  canRemove,
  onInsertAbove,
  onInsertBelow,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: RowActionsProps) {
  const t = useT()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={t.actions.rowActions}>
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={onInsertAbove}>
          <ArrowUpToLine className="size-4" />
          {t.actions.insertAbove}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onInsertBelow}>
          <ArrowDownToLine className="size-4" />
          {t.actions.insertBelow}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy className="size-4" />
          {t.actions.duplicate}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onMoveUp} disabled={index === 0}>
          <ArrowUp className="size-4" />
          {t.actions.moveUp}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onMoveDown} disabled={index >= count - 1}>
          <ArrowDown className="size-4" />
          {t.actions.moveDown}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onRemove} disabled={!canRemove}>
          <Trash2 className="size-4" />
          {t.actions.remove}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
