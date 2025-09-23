import type { NextRequest } from "next/server"

export const runtime = "edge"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// Mock AI responses that feel realistic
const mockResponses = [
  "I'd be happy to help you with that! Let me break this down step by step.",
  "That's a great question. From my experience, here's what I'd recommend:",
  "I understand what you're looking for. Let me walk you through the best approach:",
  "Interesting challenge! I've seen this before, and here's how I typically handle it:",
  "Good thinking! Let me expand on that idea and show you some alternatives:",
  "That makes sense. Here's a comprehensive solution that should work well:",
  "I can definitely help with that. Let me explain the concept and then show you how to implement it:",
  "Perfect timing for this question! I just helped someone with something similar yesterday.",
]

const mockContinuations = [
  " The key thing to remember is that you want to keep your code maintainable and readable.",
  " One approach that works really well is to start simple and then gradually add complexity as needed.",
  " I'd suggest testing this thoroughly before deploying to production, especially the edge cases.",
  " Make sure to consider performance implications, particularly if you're dealing with large datasets.",
  " Don't forget to handle error cases gracefully - users will appreciate good error messages.",
  " Documentation is crucial here, so future you (or your teammates) will thank you later.",
  " Consider the user experience throughout this process - smooth interactions make all the difference.",
  " Security should be a priority, so make sure to validate inputs and sanitize outputs properly.",
]

function generateStreamingResponse(userMessage: string): string {
  const baseResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
  const continuation = mockContinuations[Math.floor(Math.random() * mockContinuations.length)]

  // Add some context-aware responses
  let contextualResponse = ""
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes("react") || lowerMessage.includes("component")) {
    contextualResponse =
      " When working with React components, I always recommend following the single responsibility principle. Each component should do one thing well."
  } else if (lowerMessage.includes("database") || lowerMessage.includes("sql")) {
    contextualResponse =
      " For database operations, always think about data integrity and performance. Proper indexing and query optimization can make a huge difference."
  } else if (lowerMessage.includes("api") || lowerMessage.includes("endpoint")) {
    contextualResponse =
      " API design is crucial for maintainability. RESTful principles and clear documentation will save you time in the long run."
  } else if (lowerMessage.includes("css") || lowerMessage.includes("style")) {
    contextualResponse =
      " CSS can be tricky, but with modern tools like Tailwind or CSS-in-JS, you can create maintainable and responsive designs."
  } else if (lowerMessage.includes("error") || lowerMessage.includes("bug")) {
    contextualResponse =
      " Debugging can be frustrating, but systematic approaches usually reveal the root cause. Start with the error message and work backwards."
  }

  return baseResponse + contextualResponse + continuation + " Would you like me to elaborate on any specific part?"
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "user") {
      return new Response("Last message must be from user", { status: 400 })
    }

    const responseText = generateStreamingResponse(lastMessage.content)

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate realistic typing speed
        const words = responseText.split(" ")

        for (let i = 0; i < words.length; i++) {
          const chunk = i === 0 ? words[i] : " " + words[i]
          controller.enqueue(encoder.encode(chunk))

          // Variable delay to simulate natural typing
          const delay = Math.random() * 100 + 50 // 50-150ms per word
          await new Promise((resolve) => setTimeout(resolve, delay))
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
