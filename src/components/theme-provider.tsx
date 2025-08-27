"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system" // 默认跟随系统
      enableSystem          // 开启系统跟随
    >
      {children}
    </NextThemesProvider>
  )
}
