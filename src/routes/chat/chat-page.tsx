import { ChatInput } from "@/features/chat-input/chat-input";
import { toast } from "sonner";

export function ChatPage() {
  const handleSubmit = (text: string) => {
    toast.success("Message sent!", {
      description: text,
    });
    // TODO: Handle message submission
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
      {/* Multiple rows of cards to create scrollable content */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />

      {/* Chat Input */}
      <div className="sticky bottom-0">
        <ChatInput onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
