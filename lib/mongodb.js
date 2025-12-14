// MongoDB REST API client for  environment
// Uses MongoDB Atlas Data API instead of MongoDB client

const MONGODB_URI = process.env.MONGODB_URI
const API_KEY = process.env.MONGODB_API_KEY || "demo"

// Parse MongoDB URI to get connection details
function parseMongoURI(uri) {
  if (!uri) throw new Error("MONGODB_URI not found")
  
  const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\//)
  if (!match) throw new Error("Invalid MongoDB URI format")
  
  return {
    username: match[1],
    password: match[2],
    cluster: match[3],
  }
}

// Simple in-memory store for development
let store = {
  users: [],
  appointments: [],
  labTests: [],
  treatments: [],
  payments: [],
  notifications: [],
}

export async function connectDB() {
  console.log("[AA] Using in-memory database for  environment")
  return store
}

export function getDB() {
  return store
}

export async function disconnectDB() {
  console.log("[AA] Database disconnected")
}

export async function closeConnection() {
  console.log("[AA] Connection closed")
}

export { store }
