import { cn } from '@/utils/cn'

/** Four small bolt-head circles in the corners of a card — a subtle
 *  steel-construction motif (rivets/fasteners) instead of plain rounded
 *  corners, fitting a fabrication/racking business. Pure decoration,
 *  absolutely positioned so it doesn't affect the card's own layout. */
export function BoltCorners({ light = false }: { light?: boolean }) {
  const dot = cn(
    'absolute h-2 w-2 rounded-full',
    light ? 'bg-white/25 ring-1 ring-white/10' : 'bg-navy/15 ring-1 ring-navy/5',
  )
  return (
    <>
      <span className={cn(dot, 'left-3 top-3')} aria-hidden />
      <span className={cn(dot, 'right-3 top-3')} aria-hidden />
      <span className={cn(dot, 'bottom-3 left-3')} aria-hidden />
      <span className={cn(dot, 'bottom-3 right-3')} aria-hidden />
    </>
  )
}
