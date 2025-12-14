"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [role, setRole] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    const storedUserType = localStorage.getItem("userType")
    const storedRole = localStorage.getItem("role")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setUserType(storedUserType)
      setRole(storedRole)
    }

    setLoading(false)
  }, [])

  const login = async (email, password, userType) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, userType }),
      })

      const data = await response.json()

      if (data.success) {
        setToken(data.token)
        setUser(data.user)
        setUserType(data.userType)
        setRole(data.role)

        // Store in localStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("userType", data.userType)
        localStorage.setItem("role", data.role)

        // Redirect based on user type
        switch (data.userType) {
          case "patient":
            router.push("/patient/dashboard")
            break
          case "doctor":
            router.push("/doctor/dashboard")
            break
          case "staff":
            router.push("/staff/dashboard")
            break
          default:
            router.push("/dashboard")
        }

        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setUserType(null)
    setRole(null)

    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userType")
    localStorage.removeItem("role")

    router.push("/")
  }

  const value = {
    user,
    userType,
    role,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
