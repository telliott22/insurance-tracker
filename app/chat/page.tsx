"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (input.trim() === "") return

    const newMessage: Message = { id: Date.now().toString(), role: "user", content: input }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: input,
          messages: updatedMessages.map(msg => ({ role: msg.role, content: msg.content }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: Message = { id: Date.now().toString() + "-ai", role: "assistant", content: data.response }
      setMessages((prevMessages) => [...prevMessages, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
            isInputFocused ? "opacity-50" : "opacity-0 pointer-events-none"
          }`}
          style={{ zIndex: 1 }}
        />

        <div className="w-full max-w-3xl flex flex-col h-full relative z-10">
          <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-slate-800/50 border border-slate-700 shadow-lg mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Bot className="w-12 h-12 mb-4" />
                <p className="text-lg">Ask me anything about your policies or invoices!</p>
                <p className="text-sm mt-2">
                  I can help you track reimbursements, understand policy details, and more.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 border border-slate-700 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-700 text-white rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 border border-slate-700 rounded-full bg-slate-600 text-white flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start gap-3 mb-4 justify-start">
                <div className="w-8 h-8 border border-slate-700 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[70%] p-3 rounded-lg bg-slate-700 text-white rounded-bl-none">
                  <p className="text-sm animate-pulse">Typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="relative w-full">
            <textarea
              placeholder="Ask about your policies or invoices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              rows={1}
              className={`min-h-[48px] max-h-[200px] overflow-y-auto rounded-lg resize-none p-4 pr-16 bg-slate-800/50 border border-slate-600 text-white placeholder:text-slate-400 
                focus:ring-4 focus:ring-blue-600 focus:border-transparent 
                transition-all duration-300 ease-in-out 
                ${isInputFocused ? "shadow-lg" : ""}`}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute w-8 h-8 top-3 right-3 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ""}
            >
              <ArrowUp className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">
            AI Assistant can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}
