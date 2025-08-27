"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// 用 React.ComponentProps 来推断类型，稳定不易炸
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
