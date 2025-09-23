"use client"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  lastMessage: string
  timestamp: Date
  createdAt: Date
}

const STORAGE_KEY = "ai-chat-sessions"
const MAX_SESSIONS = 50 // Limit to prevent localStorage bloat

// Helper to safely parse JSON from localStorage
function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json)
    // Convert timestamp strings back to Date objects
    if (Array.isArray(parsed)) {
      return parsed.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        createdAt: new Date(session.createdAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      })) as T
    }
    return parsed
  } catch {
    return fallback
  }
}

// Generate a smart title from the first user message
function generateChatTitle(firstMessage: string): string {
  const cleanMessage = firstMessage.trim().slice(0, 50)

  // Common patterns to create better titles
  if (cleanMessage.toLowerCase().includes("help")) {
    return `Help: ${cleanMessage.replace(/help\s*/i, "").slice(0, 30)}...`
  }
  if (cleanMessage.toLowerCase().includes("how")) {
    return `How-to: ${cleanMessage.slice(0, 35)}...`
  }
  if (cleanMessage.toLowerCase().includes("what")) {
    return `Question: ${cleanMessage.slice(0, 35)}...`
  }
  if (cleanMessage.toLowerCase().includes("explain")) {
    return `Explain: ${cleanMessage.replace(/explain\s*/i, "").slice(0, 30)}...`
  }

  return cleanMessage.length > 40 ? `${cleanMessage.slice(0, 40)}...` : cleanMessage
}

export class ChatStorage {
  static getSessions(): ChatSession[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const sessions = safeParseJSON<ChatSession[]>(stored, [])

    // Sort by most recent first
    return sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  static getSession(sessionId: string): ChatSession | null {
    const sessions = this.getSessions()
    return sessions.find((session) => session.id === sessionId) || null
  }

  static saveSession(session: ChatSession): void {
    if (typeof window === "undefined") return

    const sessions = this.getSessions()
    const existingIndex = sessions.findIndex((s) => s.id === session.id)

    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.unshift(session)
    }

    // Limit the number of stored sessions
    const limitedSessions = sessions.slice(0, MAX_SESSIONS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSessions))
  }

  static createSession(firstMessage?: string): ChatSession {
    const now = new Date()
    const sessionId = `chat-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`

    const session: ChatSession = {
      id: sessionId,
      title: firstMessage ? generateChatTitle(firstMessage) : "New Chat",
      messages: [],
      lastMessage: firstMessage || "Start a conversation...",
      timestamp: now,
      createdAt: now,
    }

    return session
  }

  static updateSession(sessionId: string, updates: Partial<ChatSession>): void {
    const sessions = this.getSessions()
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

    if (sessionIndex >= 0) {
      sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates, timestamp: new Date() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    }
  }

  static deleteSession(sessionId: string): void {
    if (typeof window === "undefined") return

    const sessions = this.getSessions()
    const filteredSessions = sessions.filter((s) => s.id !== sessionId)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions))
  }

  static addMessageToSession(sessionId: string, message: Message): void {
    const session = this.getSession(sessionId)
    if (!session) return

    const updatedMessages = [...session.messages, message]
    const lastMessage = message.role === "user" ? message.content : session.lastMessage

    // Update title if this is the first user message
    let title = session.title
    if (session.messages.length === 0 && message.role === "user") {
      title = generateChatTitle(message.content)
    }

    this.updateSession(sessionId, {
      messages: updatedMessages,
      lastMessage,
      title,
    })
  }

  static updateMessageInSession(sessionId: string, messageId: string, updates: Partial<Message>): void {
    const session = this.getSession(sessionId)
    if (!session) return

    const updatedMessages = session.messages.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))

    this.updateSession(sessionId, { messages: updatedMessages })
  }

  static clearAllSessions(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
  }

  static exportSessions(): string {
    const sessions = this.getSessions()
    return JSON.stringify(sessions, null, 2)
  }

  static importSessions(jsonData: string): boolean {
    try {
      const sessions = JSON.parse(jsonData) as ChatSession[]
      if (Array.isArray(sessions)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
        return true
      }
      return false
    } catch {
      return false
    }
  }
}
