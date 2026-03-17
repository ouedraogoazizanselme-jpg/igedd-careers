import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'IGEDD Careers — Burkina Faso',
  description: 'Plateforme de stages et emplois pour les étudiants de l\'IGEDD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-[#f5f4f0] min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}