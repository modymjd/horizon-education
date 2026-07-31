import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata={title:'Horizon Education',description:'RTL e-learning platform'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}
