import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Horizon Education | حورايزون تعليم",
  description: "منصة تعليمية عربية لإدارة الكورسات والحصص والمدرسين والطلاب",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
