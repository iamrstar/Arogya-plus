import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Suspense } from "react"

export const metadata = {
  title: "Arogya Hospital Management System",
  description: "Comprehensive hospital management system for Arogya Super Specialty Hospital"
    
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
