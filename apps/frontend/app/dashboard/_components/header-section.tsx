// apps/frontend/app/dashboard/_components/header-section.tsx
"use client"
import { useDashboard } from "../_hooks/use-dashboard"

export const HeaderSection = () => {
  const { currentTime, formatDateDisplay, formatTimeDisplay } = useDashboard()
  
  return (
    <div className="text-right">
      <p className="text-sm text-gray-500">{formatDateDisplay(currentTime)}</p>
      <p className="text-lg font-medium">{formatTimeDisplay(currentTime)}</p>
    </div>
  )
}
