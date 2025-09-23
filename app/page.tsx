"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, Plus } from "lucide-react"
import { useChatSessions } from "@/hooks/use-chat-sessions"

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { sessions, currentSessionId, currentSession, isLoading, createNewSession, selectSession, deleteSession } =
    useChatSessions()

  const handleNewChat = () => {
    createNewSession()
    setSidebarOpen(false)
  }

  const handleSelectChat = (chatId: string) => {
    selectSession(chatId)
    setSidebarOpen(false)
  }

  const handleDeleteChat = (chatId: string) => {
    deleteSession(chatId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading chat history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-background/80 backdrop-blur-sm border"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatSessions={sessions}
        currentChatId={currentSessionId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col lg:ml-80">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
                {currentSession && (
                  <p className="text-sm text-muted-foreground truncate max-w-md">{currentSession.title}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </header>

        <ChatInterface chatId={currentSessionId || "default"} initialMessages={currentSession?.messages || []} />
      </div>
    </div>
  )
}
