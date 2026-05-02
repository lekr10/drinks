import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drink Tracker',
  description: 'Log smarter. Learn your limits.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950">{children}</body>
    </html>
  )
}
