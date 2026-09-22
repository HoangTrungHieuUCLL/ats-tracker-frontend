import type { ApplicationStatus } from "../api/types"

const OPTIONS: ApplicationStatus[] = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
  "closed",
]

export default function ApplicationStatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: ApplicationStatus
  onChange: (value: ApplicationStatus) => void
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white disabled:opacity-50"
    >
      {OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  )
}
