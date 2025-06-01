import * as React from "react"
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  return {
    toast: ({ title, description, variant = "default" }: ToastProps) => {
      if (variant === "destructive") {
        sonnerToast.error(title || description)
      } else {
        sonnerToast.success(title || description)
      }
    },
  }
}

// 直接使用できるtoast関数もエクスポート
export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  if (variant === "destructive") {
    sonnerToast.error(title || description)
  } else {
    sonnerToast.success(title || description)
  }
}
