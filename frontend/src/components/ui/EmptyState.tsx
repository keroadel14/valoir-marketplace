export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-2xl">{title}</p>
      {hint && <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{hint}</p>}
    </div>
  )
}
