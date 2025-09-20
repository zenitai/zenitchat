import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AuthModal } from "@/features/auth";
import { useAuth } from "@/features/auth";
import { useScrollToBottom } from "@/features/chat-input/hooks/use-scroll-to-bottom";
import { Message } from "@/features/messages/message";
import type { MyUIMessage } from "@/features/messages/types";
import { ChatInput } from "@/features/chat-input/chat-input";

export function ChatPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [chatInputHeight, setChatInputHeight] = useState(141);
  const {
    isAuthenticated,
    unAuthedNewUser,
    unAuthedReturningUser,
    markAsVisited,
  } = useAuth();

  // Use the useChat hook for message management
  const { messages, sendMessage, status, error } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  // Use scroll to bottom hook
  const {
    showScrollToBottom,
    scrollToBottom,
    scrollContainerRef,
    messagesEndRef,
    updateScrollPosition,
  } = useScrollToBottom();

  // Create a ref callback for the messages container that updates scroll position
  const messagesContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        // Use requestAnimationFrame to ensure DOM has updated after messages render
        requestAnimationFrame(updateScrollPosition);
      }
    },
    [updateScrollPosition],
  );

  const handleChatInputHeightChange = useCallback((height: number) => {
    setChatInputHeight(height);
  }, []);

  const handleSubmit = (text: string) => {
    // Check if user is authenticated before allowing message submission
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // If no threadId, create a new thread by navigating to a new URL
    if (!threadId) {
      const newThreadId = crypto.randomUUID();
      navigate(`/chat/${newThreadId}`, { replace: true });
    }

    // Send message using useChat hook
    sendMessage({ text });
  };

  return (
    <div className="relative h-full">
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto custom-scrollbar"
        style={{
          scrollbarGutter: "stable both-edges",
        }}
      >
        <div
          ref={messagesContainerRef}
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 py-6"
          style={{
            paddingBottom: `${chatInputHeight + 48}px`,
          }}
        >
          {messages.length > 0 ? (
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          ) : (
            // Empty state - no text during loading, just empty space
            <div />
          )}

          {/* Show error message if there's an error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm">Please try again or refresh the page.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Prompt input area - sticky to bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-2">
        <ChatInput
          onSubmit={handleSubmit}
          onHeightChange={handleChatInputHeightChange}
          showScrollToBottom={showScrollToBottom}
          onScrollToBottom={scrollToBottom}
          disabled={status !== "ready"}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        unAuthedNewUser={unAuthedNewUser}
        unAuthedReturningUser={unAuthedReturningUser}
        markAsVisited={markAsVisited}
      />
    </div>
  );
}
