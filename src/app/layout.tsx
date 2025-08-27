import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script";

/**
 * 引入Geist Sans字体
 * Geist Sans是一款现代、清晰的无衬线字体，适合用于正文和标题
 */
const geistSans = Geist({
  variable: "--font-geist-sans", // 设置CSS变量名
  subsets: ["latin"],           // 加载拉丁字符集，减少字体文件大小
});

/**
 * 引入Geist Mono字体
 * Geist Mono是一款等宽字体，适合用于代码显示
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // 设置CSS变量名
  subsets: ["latin"],           // 加载拉丁字符集，减少字体文件大小
});

/**
 * 视口配置
 * 设置移动设备显示和缩放行为
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" }
  ]
};

/**
 * 网站元数据配置
 * 这些信息对SEO优化和社交媒体分享非常重要
 */
export const metadata: Metadata = {
  // 基础元数据
  title: "动动吗",
  description: "Editing WeChat step count has never been easier.",
  applicationName: "小米运动步数修改",
  keywords: ["小米运动", "微信运动", "步数修改", "健康数据", "运动数据同步"],
  authors: [{ name: "ymyuuu", url: "https://github.com/ymyuuu" }],
  category: "工具",
  
  // Open Graph协议元数据，用于社交媒体分享
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://steps.8bq.ovh",
    title: "动动吗",
    description: "Editing WeChat step count has never been easier.",
    siteName: "动动吗",
    images: [
      {
        url: "/logo.png", // 请替换为实际的图片路径
        width: 400,
        height: 400,
        alt: "动动吗预览图"
      }
    ]
  },
  
  // Twitter卡片元数据
  twitter: {
    card: "summary_large_image",
    title: "动动吗",
    description: "Editing WeChat step count has never been easier.",
    images: ["/logo.png"], // 请替换为实际的图片路径
    creator: "@ymyuuu" // 如果有推特账号，请替换
  },
  
  // 机器人抓取指令
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },
  
  // 网站图标
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  
  // 添加PWA相关元数据
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "动动吗",
    statusBarStyle: "black-translucent",
  },
};

/**
 * 根布局组件
 * 包含了应用的全局布局和主题提供者
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件内容
 * @returns {JSX.Element} 根布局组件
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 添加用于注册Service Worker的内联脚本 */}
        <Script
          id="register-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(registration) {
                      console.log('Service Worker 注册成功，作用域：', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('Service Worker 注册失败：', error);
                    });
                });
                
                // 检测Service Worker更新
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (refreshing) return;
                  refreshing = true;
                  window.location.reload();
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ThemeProvider用于提供深色/浅色主题切换功能 */}
        <ThemeProvider
          attribute="class"         // 使用class属性控制主题
          defaultTheme="system"     // 默认使用系统主题
          enableSystem              // 启用系统主题检测
          disableTransitionOnChange // 禁用主题切换时的过渡动画，减少闪烁
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
