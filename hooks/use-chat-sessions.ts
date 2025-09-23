"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatStorage } from "@/lib/chat-storage"

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

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load sessions from storage on mount
  useEffect(() => {
    const loadSessions = () => {
      const storedSessions = ChatStorage.getSessions()
      setSessions(storedSessions)

      // If no current session and we have sessions, select the most recent
      if (!currentSessionId && storedSessions.length > 0) {
        setCurrentSessionId(storedSessions[0].id)
      }

      setIsLoading(false)
    }

    loadSessions()
  }, [currentSessionId])

  const createNewSession = useCallback((firstMessage?: string) => {
    const newSession = ChatStorage.createSession(firstMessage)
    ChatStorage.saveSession(newSession)

    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)

    return newSession.id
  }, [])

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
  }, [])

  const deleteSession = useCallback(
    (sessionId: string) => {
      ChatStorage.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))

      // If we deleted the current session, select another one
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId)
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].id)
        } else {
          // Create a new session if no sessions remain
          createNewSession()
        }
      }
    },
    [currentSessionId, sessions, createNewSession],
  )

  const getCurrentSession = useCallback(() => {
    if (!currentSessionId) return null
    return sessions.find((s) => s.id === currentSessionId) || null
  }, [currentSessionId, sessions])

  const addMessageToCurrentSession = useCallback(
    (message: Message) => {
      if (!currentSessionId) return

      ChatStorage.addMessageToSession(currentSessionId, message)

      // Update local state
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId) {
            const updatedMessages = [...session.messages, message]
            let title = session.title

            // Update title if this is the first user message
            if (session.messages.length === 0 && message.role === "user") {
              title = message.content.slice(0, 40) + (message.content.length > 40 ? "..." : "")
            }

            return {
              ...session,
              messages: updatedMessages,
              lastMessage: message.role === "user" ? message.content : session.lastMessage,
              title,
              timestamp: new Date(),
            }
          }
          return session
        }),
      )
    },
    [currentSessionId],
  )

  const updateMessageInCurrentSession = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      if (!currentSessionId) return

      ChatStorage.updateMessageInSession(currentSessionId, messageId, updates)

      // Update local state
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: session.messages.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)),
              timestamp: new Date(),
            }
          }
          return session
        }),
      )
    },
    [currentSessionId],
  )

  const clearAllSessions = useCallback(() => {
    ChatStorage.clearAllSessions()
    setSessions([])
    createNewSession()
  }, [createNewSession])

  return {
    sessions,
    currentSessionId,
    currentSession: getCurrentSession(),
    isLoading,
    createNewSession,
    selectSession,
    deleteSession,
    addMessageToCurrentSession,
    updateMessageInCurrentSession,
    clearAllSessions,
  }
}
