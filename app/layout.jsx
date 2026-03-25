import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Suspense } from "react"

export const metadata = {
  title: "Arogya Hospital Management System",
  description: "Comprehensive hospital management system for Arogya Super Specialty Hospital"
}

import { SwasthyaAssistant } from "@/components/chat/swasthya-assistant"

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <SwasthyaAssistant />
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
