import { NextResponse } from "next/server"

// Simple token validation function
function validateToken(token) {
  try {
    // Decode base64 token
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))

    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

export function middleware(request) {
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/api/auth/login", "/api/auth/register", "/register", "/api/chat"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if user is trying to access protected routes
  const protectedRoutes = ["/patient", "/doctor", "/staff", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (token) {
    const decoded = validateToken(token)

    if (!decoded) {
      // Invalid or expired token, redirect to login
      return NextResponse.redirect(new URL("/", request.url))
    }

    const userType = decoded.userType
    const role = decoded.role

    if (request.nextUrl.pathname.startsWith("/patient") && userType !== "patient") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (request.nextUrl.pathname.startsWith("/doctor") && userType !== "doctor") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (request.nextUrl.pathname.startsWith("/staff") && userType !== "staff") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", decoded.userId)
    requestHeaders.set("x-user-type", userType)
    requestHeaders.set("x-user-role", role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
