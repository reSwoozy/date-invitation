export function CalendarSkeleton() {
  return (
    <div className="date-picker date-picker-skeleton" aria-hidden="true">
      <div className="skeleton-line skeleton-line-short" />
      <div className="skeleton-calendar" />
    </div>
  )
}
