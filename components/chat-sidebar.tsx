"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Plus, MessageSquare, Trash2, Download, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatStorage } from "@/lib/chat-storage"
import { useToast } from "@/hooks/use-toast"

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  chatSessions: ChatSession[]
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
}

export function ChatSidebar({
  isOpen,
  onClose,
  chatSessions,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const { toast } = useToast()

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return timestamp.toLocaleDateString()
  }

  const handleExportChats = () => {
    try {
      const data = ChatStorage.exportSessions()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chat-history-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Chat history has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export chat history",
        variant: "destructive",
      })
    }
  }

  const handleImportChats = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string
          const success = ChatStorage.importSessions(data)

          if (success) {
            toast({
              title: "Import successful",
              description: "Chat history has been imported",
            })
            // Refresh the page to load imported sessions
            window.location.reload()
          } else {
            throw new Error("Invalid file format")
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Could not import chat history. Please check the file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-background border-r z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-foreground">Chat History</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onNewChat} className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat sessions */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {chatSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                  <p className="text-xs mt-1">Start a conversation to see it here</p>
                </div>
              ) : (
                chatSessions.map((session) => (
                  <Card
                    key={session.id}
                    className={cn(
                      "p-3 cursor-pointer transition-colors hover:bg-muted/50 group",
                      currentChatId === session.id && "bg-muted border-primary/50",
                    )}
                    onClick={() => onSelectChat(session.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">{session.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{session.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatTimestamp(session.timestamp)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(session.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button onClick={onNewChat} className="w-full justify-start gap-2 bg-transparent" variant="outline">
              <Plus className="h-4 w-4" />
              Start New Chat
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportChats}
                className="flex-1 text-xs"
                disabled={chatSessions.length === 0}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={handleImportChats} className="flex-1 text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
