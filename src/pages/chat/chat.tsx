import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useState, useRef } from "react";
import { message } from "../../interfaces/interfaces"
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import { v4 as uuidv4 } from 'uuid';

// --- SWITCH HERE ---
const USE_WEBSOCKET = false; // Set to true for WebSocket, false for HTTP

const WS_URL = "ws://localhost:8090";
// const HTTP_URL = "http://localhost:8502/api/chat/homework";
// const HTTP_URL = "http://localhost:8502/api/chat/deepwiki";
const HTTP_URL = "http://localhost:8502/api/chat/weather";

export function Chat() {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // WebSocket refs and handlers
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  // Initialize WebSocket only if needed
  if (USE_WEBSOCKET && !socketRef.current) {
    socketRef.current = new WebSocket(WS_URL);
  }

  const cleanupMessageHandler = () => {
    if (messageHandlerRef.current && socketRef.current) {
      socketRef.current.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
  };

  async function handleSubmit(text?: string) {
    const messageText = text || question;
    if (!messageText || isLoading) return;

    setIsLoading(true);
    setMessages(prev => [
      ...prev,
      { content: messageText, role: "user", id: uuidv4() }
    ]);
    setQuestion("");

    if (USE_WEBSOCKET) {
      // --- WebSocket logic ---
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        setIsLoading(false);
        return;
      }
      cleanupMessageHandler();
      const traceId = uuidv4();
      socketRef.current.send(messageText);

      try {
        const messageHandler = (event: MessageEvent) => {
          setIsLoading(false);
          if (event.data.includes("[END]")) {
            cleanupMessageHandler();
            return;
          }
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            const newContent = lastMessage?.role === "assistant"
              ? lastMessage.content + event.data
              : event.data;
            const newMessage = { content: newContent, role: "assistant", id: traceId };
            return lastMessage?.role === "assistant"
              ? [...prev.slice(0, -1), newMessage]
              : [...prev, newMessage];
          });
        };
        messageHandlerRef.current = messageHandler;
        socketRef.current.addEventListener("message", messageHandler);
      } catch (error) {
        console.error("WebSocket error:", error);
        setIsLoading(false);
      }
    } else {
      // --- HTTP logic ---
      try {
        const response = await fetch(HTTP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        });
        const data = await response.json();
        setMessages(prev => [
          ...prev,
          { content: data.message, role: "assistant", id: uuidv4() }
        ]);
      } catch (error) {
        console.error("HTTP error:", error);
        setMessages(prev => [
          ...prev,
          { content: "Error: Could not connect to server.", role: "assistant", id: uuidv4() }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <Header />
      <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4" ref={messagesContainerRef}>
        {messages.length === 0 && <Overview />}
        {messages.map((message, index) => (
          <PreviewMessage key={index} message={message} />
        ))}
        {isLoading && <ThinkingMessage />}
        <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
      </div>
      <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
      <div className="text-xs text-center text-muted-foreground pb-2">
        Mode: <b>{USE_WEBSOCKET ? "WebSocket" : "HTTP"}</b>
      </div>
    </div>
  );
}