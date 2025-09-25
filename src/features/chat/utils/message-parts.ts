import type {
  UIMessageChunk,
  UIDataTypes,
  UITools,
  ToolUIPart,
  UIMessagePart,
} from "ai";
import type { DataUIMessageChunk } from "../core/types";

/**
 * Type guard to check if a chunk is a data UI message chunk
 */
export function isDataUIMessageChunk(
  chunk: UIMessageChunk,
): chunk is DataUIMessageChunk<UIDataTypes> {
  return chunk.type.startsWith("data-");
}

export function isToolUIPart<TOOLS extends UITools>(
  part: UIMessagePart<UIDataTypes, TOOLS>,
): part is ToolUIPart<TOOLS> {
  return part.type.startsWith("tool-");
}

export function getToolName<TOOLS extends UITools>(
  part: ToolUIPart<TOOLS>,
): keyof TOOLS {
  return part.type.split("-").slice(1).join("-") as keyof TOOLS;
}
