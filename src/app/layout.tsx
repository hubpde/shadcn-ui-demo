import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

// ---------- Metadata 自动生成 title / icons / OG ----------
export const metadata: Metadata = {
  title: "YV",
  description: "Yizi's Exclusive Personal Cinema TV",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    title: "YV",
    description: "Yizi's Exclusive Personal Cinema TV",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "YV",
    description: "Yizi's Exclusive Personal Cinema TV",
    images: ["/logo.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* 初始值，后面脚本会动态覆盖 */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var light = "#ffffff";
                var dark = "#09090b";
                var meta = document.querySelector('meta[name="theme-color"]');
                if (!meta) return;

                function apply() {
                  var isDark = document.documentElement.classList.contains("dark") ||
                                window.matchMedia("(prefers-color-scheme: dark)").matches;
                  meta.setAttribute("content", isDark ? dark : light);
                }

                apply(); // 初次
                window.matchMedia("(prefers-color-scheme: dark)")
                  .addEventListener("change", apply);
                new MutationObserver(apply)
                  .observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
