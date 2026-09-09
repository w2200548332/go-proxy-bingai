export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#ff6a00" />
        <path
          d="M16 6.5l1.7 5.2h5.5l-4.5 3.2 1.7 5.3L16 17l-4.4 3.2 1.7-5.3-4.5-3.2h5.5L16 6.5z"
          fill="#fff"
        />
      </svg>
      <span>
        星问卷
        <span className="ml-1 hidden text-xs font-normal text-slate-400 sm:inline">XingWenjuan</span>
      </span>
    </span>
  )
}
