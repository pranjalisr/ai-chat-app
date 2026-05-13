# AI Chat App

A modern AI chat application built with **Next.js**, **TypeScript**, and **Tailwind CSS**.  
It provides a clean conversational interface with streaming AI responses, saved chat sessions, chat history management, and import/export support.

## Features

- AI-powered chat interface
- Streaming assistant responses
- Stop response generation while streaming
- Regenerate last assistant response
- Multiple chat sessions
- Auto-saved chat history
- Delete old conversations
- Export chat history as JSON
- Import previous chat history
- Copy assistant/user messages
- Responsive sidebar for chat history
- Mobile-friendly layout
- Toast notifications for user actions
- Clean UI built with reusable components

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **UI:** React, Tailwind CSS
- **Components:** Radix UI / shadcn-style components
- **Icons:** Lucide React
- **Analytics:** Vercel Analytics
- **Storage:** Browser local storage
- **Package Manager:** pnpm

## Project Structure

```txt
ai-chat-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── chat-interface.tsx
│   ├── chat-sidebar.tsx
│   └── ui/
├── hooks/
│   ├── use-chat-stream.ts
│   ├── use-chat-sessions.ts
│   └── use-toast.ts
├── lib/
│   ├── chat-storage.ts
│   └── utils.ts
├── public/
├── styles/
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```
