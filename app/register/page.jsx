"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft } from "lucide-react"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  const [showSuccess, setShowSuccess] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-primary rounded-full p-2">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Arogya</h1>
                <p className="text-sm text-muted-foreground">Super Specialty Hospital</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showSuccess ? (
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-secondary mb-2">Registration Successful!</h2>
              <p className="text-muted-foreground mb-4">Your account has been created successfully.</p>
              <Link href="/">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </div>
        ) : (
          <RegisterForm onSuccess={() => setShowSuccess(true)} />
        )}
      </div>
    </div>
  )
}
