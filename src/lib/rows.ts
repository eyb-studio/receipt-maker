// Shared helpers for the ordered row lists in the editors (receipt items,
// price-list items, من receipt items, ledger rows). Every helper returns a new
// array so it can be passed straight to a `setState` updater.

export function insertRowAt<T>(list: T[], index: number, row: T): T[] {
  const at = Math.max(0, Math.min(index, list.length))
  return [...list.slice(0, at), row, ...list.slice(at)]
}

export function moveRow<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return list
  const at = Math.max(0, Math.min(to, list.length - 1))
  const next = [...list]
  const [row] = next.splice(from, 1)
  next.splice(at, 0, row)
  return next
}
