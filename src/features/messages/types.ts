import type { Doc } from "@/convex/_generated/dataModel";

// Base message type used across all message components
export interface MessageProps {
  message: Doc<"messages"> & {
    attachments: Doc<"attachments">[];
  };
  className?: string;
}
