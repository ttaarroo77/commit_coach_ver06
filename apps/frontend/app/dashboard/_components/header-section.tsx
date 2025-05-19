// apps/frontend/app/dashboard/_components/header-section.tsx
"use client"
interface Props {
  currentTime: Date
  formatDateDisplay: (d: Date) => string
  formatTimeDisplay: (d: Date) => string
}
export const HeaderSection = ({ currentTime, formatDateDisplay, formatTimeDisplay }: Props) => (
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <p className="text-sm text-gray-500">{formatDateDisplay(currentTime)}</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="text-right">
        <p className="text-sm font-medium">現在時刻</p>
        <p className="text-2xl font-bold">{formatTimeDisplay(currentTime)}</p>
      </div>
    </div>
  </div>
)
