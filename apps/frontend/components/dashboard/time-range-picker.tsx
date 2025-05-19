"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

type Props = {
  open: boolean
  defaultStart?: string
  defaultEnd?: string
  onOpenChange: (open: boolean) => void
  onSave: (start: string, end: string) => void
}

export const TimeRangePicker = ({ open, defaultStart, defaultEnd, onOpenChange, onSave }: Props) => {
  const [start, setStart] = useState(defaultStart ?? "")
  const [end, setEnd] = useState(defaultEnd ?? "")

  useEffect(() => {
    setStart(defaultStart ?? "")
    setEnd(defaultEnd ?? "")
  }, [defaultStart, defaultEnd])

  const handleSave = () => {
    onSave(start, end)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>作業時間を設定</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-xs text-gray-600">開始</label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-600">終了</label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!start || !end}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
