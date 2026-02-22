import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BelieveBoy 工具集",
  description: "彼励扶工具集 - 运营数据分析与管理",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}
