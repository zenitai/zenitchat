import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { AuthModal } from "@/features/auth";
import { useIsAuthenticated } from "@/features/auth/store";
import { useScrollToBottom } from "@/features/chat-input/hooks/use-scroll-to-bottom";
import { Message } from "@/features/messages/message";
import { ChatInput } from "@/features/chat-input/chat-input";
import { useInputHeight } from "@/features/chat-input/store";
import { useDisplayMessages } from "@/features/chat/hooks/use-display-messages";
import { sendMessage } from "@/features/chat/send-messsage";
import { useConvexFunctions } from "@/features/chat/hooks/use-convex-functions";

export function ChatPage() {
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const chatInputHeight = useInputHeight();
  const isAuthenticated = useIsAuthenticated();
  const convexFunctions = useConvexFunctions();

  // Get display messages using our custom hook
  const messages = useDisplayMessages(threadId);

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

  const handleSubmit = async (text: string) => {
    // Check if user is authenticated before allowing message submission
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Determine if this is a new thread
    const isNewThread = !threadId;
    const currentThreadId = threadId || crypto.randomUUID();

    // If no threadId, navigate to the new thread URL
    if (isNewThread) {
      navigate(`/chat/${currentThreadId}`, { replace: true });
    }

    try {
      // Send message using our Effect-based sendMessage function
      await sendMessage({
        threadId: currentThreadId,
        content: text,
        model: "gpt-4o-mini", // Default model
        isNewThread,
        convexFunctions,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // You could add error handling UI here
    }
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Prompt input area - sticky to bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-2">
        <ChatInput
          onSubmit={handleSubmit}
          showScrollToBottom={showScrollToBottom}
          onScrollToBottom={scrollToBottom}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
