import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YV",
  description: "小怡TV",
  icons: {
    icon: "https://img.icons8.com/color-pixels/300/cherry.png",       // 常规 favicon
    shortcut: "https://img.icons8.com/color-pixels/300/cherry.png",   // 快捷方式
    apple: "https://img.icons8.com/color-pixels/300/cherry.png",      // iOS 桌面图标
  },
  openGraph: {
    title: "YV",
    description: "小怡 TV",
    siteName: "YV",
    images: [
      {
        url: "https://img.icons8.com/color-pixels/300/cherry.png",
        alt: "YV Logo",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* iOS Safari 顶部状态栏样式 */}
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
