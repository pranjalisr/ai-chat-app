"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, StopCircle, RotateCcw, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStream } from "@/hooks/use-chat-stream"
import { useChatSessions } from "@/hooks/use-chat-sessions"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  chatId: string
  initialMessages?: Message[]
}

export function ChatInterface({ chatId, initialMessages = [] }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const { addMessageToCurrentSession, updateMessageInCurrentSession } = useChatSessions()

  const { messages, isLoading, isStreaming, streamResponse, stopStreaming, clearMessages, regenerateLastResponse } =
    useChatStream({
      initialMessages,
    })

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && !lastMessage.isStreaming) {
      addMessageToCurrentSession(lastMessage)
    }
  }, [messages, addMessageToCurrentSession])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Reset messages when chat changes
  useEffect(() => {
    clearMessages()
  }, [chatId, clearMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // Focus back to textarea for better UX
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)

    await streamResponse(userMessage, messages)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      })
    }
  }

  const handleError = (error: Error) => {
    toast({
      title: "Error",
      description: "Failed to get AI response. Please try again.",
      variant: "destructive",
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Start a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Ask me anything! I'm here to help with coding questions, project planning, problem-solving, or just have
                a friendly chat.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-w-md">
              {[
                "How do I optimize React performance?",
                "Explain async/await in JavaScript",
                "Best practices for API design",
                "Help me debug this CSS issue",
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-4xl group",
                  message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                )}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs font-medium",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <Card
                    className={cn(
                      "p-4 max-w-[80%]",
                      message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted/50",
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                      {message.isStreaming && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <time
                        className={cn(
                          "text-xs opacity-70",
                          message.role === "user" ? "text-primary-foreground" : "text-muted-foreground",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </Card>

                  {/* Message actions */}
                  {!message.isStreaming && (
                    <div
                      className={cn(
                        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => copyToClipboard(message.content, message.id)}
                      >
                        {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>

                      {message.role === "assistant" && index === messages.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={regenerateLastResponse}
                          disabled={isLoading}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && !isStreaming && (
              <div className="flex gap-3 max-w-4xl mr-auto">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[60px] max-h-[200px] resize-none pr-12"
                disabled={isLoading}
              />
            </div>
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={stopStreaming}
                className="shrink-0 h-[60px] w-[60px]"
              >
                <StopCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()} className="shrink-0 h-[60px] w-[60px]">
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Messages are automatically saved • {messages.length} messages in conversation
          </p>
        </form>
      </div>
    </div>
  )
}
