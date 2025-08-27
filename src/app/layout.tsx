import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
export const metadata: Metadata = {
  title: "YV",
  description: "小怡TV",
  icons: "/logo.png",
  openGraph: {
    title: "YV",
    description: "小怡 TV",
    siteName: "YV",
    images: [{ url: "/logo.png", alt: "YV Logo" }],
    locale: "zh_CN",
    type: "website",
  },
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* iOS Safari 顶部状态栏样式 */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
