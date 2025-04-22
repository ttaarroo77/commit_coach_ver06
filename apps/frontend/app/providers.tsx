"use client"

import { type ReactNode } from "react"
import dynamic from "next/dynamic"

const AuthProvider = dynamic(
  () => import("@/context/auth-context").then(mod => mod.AuthProvider),
  { ssr: false }
)

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
} 