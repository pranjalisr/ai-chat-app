"use client"

import { useState, useCallback, useRef } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface UseChatStreamOptions {
  initialMessages?: Message[]
  onMessageUpdate?: (messages: Message[]) => void
  onMessageStreamUpdate?: (messageId: string, updates: Partial<Message>) => void
  onError?: (error: Error) => void
}

export function useChatStream(options: UseChatStreamOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(options.initialMessages || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const addMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => {
        const newMessages = [...prev, message]
        // Call callback after state update, not during
        setTimeout(() => {
          if (!message.isStreaming) {
            options.onMessageUpdate?.(newMessages)
          }
        }, 0)
        return newMessages
      })
    },
    [options.onMessageUpdate],
  )

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) => {
        const newMessages = prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
        // Call callback after state update
        setTimeout(() => {
          options.onMessageStreamUpdate?.(messageId, updates)
        }, 0)
        return newMessages
      })
    },
    [options.onMessageStreamUpdate],
  )

  const streamResponse = useCallback(
    async (userMessage: string, conversationHistory: Message[] = []) => {
      if (isLoading) return

      setIsLoading(true)
      setIsStreaming(true)

      // Add user message
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      }
      addMessage(userMsg)

      // Create abort controller for this request
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: userMessage },
            ],
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Create streaming assistant message
        const assistantMessageId = `assistant-${Date.now()}`
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        }

        addMessage(assistantMessage)

        // Read the stream
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No response body")
        }

        let accumulatedContent = ""

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk

          // Update the streaming message with accumulated content
          updateMessage(assistantMessageId, { content: accumulatedContent })
        }

        // Mark streaming as complete
        updateMessage(assistantMessageId, { isStreaming: false })
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, clean up any streaming message
          setMessages((prev) => prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg)))
          return
        }

        console.error("Error streaming response:", error)
        options.onError?.(error as Error)

        // Add error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date(),
        }
        addMessage(errorMessage)
      } finally {
        setIsLoading(false)
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [isLoading, addMessage, updateMessage, options],
  )

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const regenerateLastResponse = useCallback(() => {
    const currentMessages = messages
    if (currentMessages.length < 2) return

    // Find the last user message
    const lastUserMessageIndex = currentMessages.findLastIndex((msg) => msg.role === "user")
    if (lastUserMessageIndex === -1) return

    const lastUserMessage = currentMessages[lastUserMessageIndex]
    const conversationHistory = currentMessages.slice(0, lastUserMessageIndex)

    // Remove messages after the last user message
    setMessages(conversationHistory)

    // Regenerate response
    setTimeout(() => {
      streamResponse(lastUserMessage.content, conversationHistory)
    }, 100)
  }, [messages, streamResponse])

  return {
    messages,
    isLoading,
    isStreaming,
    streamResponse,
    stopStreaming,
    clearMessages,
    regenerateLastResponse,
    addMessage,
    updateMessage,
  }
}
