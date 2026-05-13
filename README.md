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
## How It Works

The app allows users to start a conversation with an AI assistant.
When a message is sent, the frontend sends the conversation history to the `/api/chat` endpoint and receives a streamed response.

Chat sessions are stored locally in the browser, so users can return to previous conversations without needing a database. Users can also export their chat history as a JSON file and import it later.

Installation

Clone the repository:

git clone https://github.com/pranjalisr/ai-chat-app.git
cd ai-chat-app

Install dependencies:

pnpm install

Start the development server:

pnpm dev

Open the app in your browser:

http://localhost:3000
Available Scripts
pnpm dev

Runs the app in development mode.

pnpm build

Builds the app for production.

pnpm start

Starts the production server.

pnpm lint

Runs lint checks.

Environment Variables

Create a .env.local file in the root directory.

Example:

AI_API_KEY=your_api_key_here

Update the API route according to the AI provider you are using.

Core Functionality
Chat Interface

The chat interface supports:

Sending messages
Streaming assistant replies
Copying messages
Showing loading state
Stopping response generation
Regenerating the latest response
Auto-scrolling to the newest message
Chat Sessions

The app supports multiple conversations. Each session contains:

Unique session ID
Chat title
Messages
Last message preview
Created timestamp
Updated timestamp
Import and Export

Users can export chat history as a .json file and import it again later.
This makes it easy to back up conversations or move them between browsers.

Use Cases
Personal AI assistant
Coding help chatbot
Project planning assistant
Debugging helper
Learning companion
AI-powered productivity tool
Future Improvements
Add authentication
Store conversations in a database
Add support for multiple AI models
Add markdown rendering for assistant messages
Add syntax highlighting for code blocks
Add file upload support
Add voice input
Add dark/light theme toggle
Add user profile and settings page
Deploy with a production-ready backend API
Screenshots

Add screenshots here:

![AI Chat App Screenshot](./public/screenshot.png)
Deployment

The app can be deployed easily on Vercel.

pnpm build

Then connect the GitHub repository to Vercel and add the required environment variables.

Author

Pranjali Srivastava

GitHub: @pranjalisr

License

This project is open-source and available under the MIT License.
