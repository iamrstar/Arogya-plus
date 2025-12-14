export function verifyToken(token) {
  try {
    if (!token) {
      throw new Error("No token provided")
    }

    // Decode base64 token
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const payload = JSON.parse(decoded)

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired")
    }

    return payload
  } catch (error) {
    console.error("[AA] Token verification error:", error)
    throw new Error("Invalid token")
  }
}

export function generateToken(user) {
  const payload = {
    userId: user._id?.toString() || user.id,
    email: user.email,
    userType: user.userType,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  }

  return Buffer.from(JSON.stringify(payload)).toString("base64")
}
