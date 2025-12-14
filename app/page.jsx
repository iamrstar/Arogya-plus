"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const { login } = useAuth()
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    userType: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await login(loginData.email, loginData.password, loginData.userType)

    if (!result.success) {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const demoCredentials = [
    { type: "Doctor", email: "rajesh.kumar@arogya.com", password: "doctor123" },
    { type: "Patient", email: "rahul.verma@email.com", password: "patient123" },
    { type: "Staff (Nurse)", email: "mary.nurse@arogya.com", password: "staff123" },
    { type: "Staff (Admin)", email: "sarah.admin@arogya.com", password: "staff123" },
  ]

  const fillDemoCredentials = (email, password, userType) => {
    setLoginData({ email, password, userType })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-full p-2 w-10 h-10 flex items-center justify-center">
                <span className="text-primary-foreground text-lg font-bold">❤️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Arogya</h1>
                <p className="text-sm text-muted-foreground">Super Specialty Hospital</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span>📞</span>
                  <span>+91-9876543210</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>✉️</span>
                  <span>info@arogya.com</span>
                </div>
              </div>
              <ThemeToggle />
              <Link href="/register">
                <Button variant="outline" size="sm">
                  👤 Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Hospital Info */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-primary mb-4 text-balance">Your Health, Our Priority</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Experience world-class healthcare with cutting-edge technology and compassionate care. Arogya Super
                Specialty Hospital provides comprehensive medical services with easy access to all treatments.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary/20 rounded-full p-2 text-2xl">👨‍⚕️</div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Expert Doctors</h3>
                      <p className="text-sm text-muted-foreground">Specialized care from experienced professionals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary/20 rounded-full p-2 text-2xl">📅</div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Easy Appointments</h3>
                      <p className="text-sm text-muted-foreground">Book appointments online 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary/20 rounded-full p-2 text-2xl">📋</div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Digital Reports</h3>
                      <p className="text-sm text-muted-foreground">Access lab reports and medical records online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary/20 rounded-full p-2 text-2xl">🔒</div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Secure & Safe</h3>
                      <p className="text-sm text-muted-foreground">Your data is protected with advanced security</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hospital Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-card/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Expert Doctors</div>
              </div>
              <div className="bg-card/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Emergency Care</div>
              </div>
              <div className="bg-card/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground">Specialties</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">Welcome Back</CardTitle>
                <CardDescription>Sign in to access your healthcare dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userType">I am a</Label>
                    <Select
                      value={loginData.userType}
                      onValueChange={(value) => setLoginData({ ...loginData, userType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="staff">Staff Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{error}</div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      Register here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            {/* <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Demo Credentials</CardTitle>
                <CardDescription>Click on any credential to auto-fill the login form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoCredentials.map((cred, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3 bg-transparent"
                      onClick={() =>
                        fillDemoCredentials(cred.email, cred.password, cred.type.split(" ")[0].toLowerCase())
                      }
                    >
                      <div className="text-left">
                        <div className="font-medium">{cred.type}</div>
                        <div className="text-xs text-muted-foreground">{cred.email}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary rounded-full p-2 w-10 h-10 flex items-center justify-center">
                  <span className="text-primary-foreground text-lg">❤️</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary">Arogya</h3>
                  <p className="text-sm text-muted-foreground">Super Specialty Hospital</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Providing world-class healthcare services with compassion and excellence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Contact Info</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Mumbai, Maharashtra</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+91-9876543210</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✉️</span>
                  <span>info@arogya.com</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Services</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Emergency Care</div>
                <div>Cardiology</div>
                <div>Neurology</div>
                <div>Orthopedics</div>
                <div>Pediatrics</div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-4 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Arogya Super Specialty Hospital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
