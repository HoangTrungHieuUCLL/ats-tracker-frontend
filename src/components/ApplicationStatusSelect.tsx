import type { ApplicationStatus } from "../api/types"
import { SELECT } from "../styles/ui"

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
      className={SELECT}
    >
      {OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  )
}
