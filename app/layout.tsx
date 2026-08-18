import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Horizon Education",
  description:
    "An online education platform for managing courses, lessons, teachers, students, access codes, assignments, exams, and certificates.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  )
}
