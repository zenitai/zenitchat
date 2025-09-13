// Parse model display name to separate main text from parentheses and handle dash separation
export interface ParsedDisplayName {
  mainText: string;
  firstPart: string;
  secondPart: string;
  parenText: string | null;
}

export function parseDisplayName(displayName: string): ParsedDisplayName {
  const parenMatch = displayName.match(/^(.+?)\s*(\([^)]+\))$/);
  const mainText = (parenMatch ? parenMatch[1] : displayName).trim();
  const parenText = parenMatch ? parenMatch[2] : null;

  // Check if the main text contains a dash for splitting
  if (mainText.includes("-")) {
    const dashParts = mainText.split("-");
    return {
      mainText,
      firstPart: dashParts[0]?.trim() ?? "",
      secondPart: dashParts.slice(1).join("-").trim(), // Handle multiple dashes
      parenText: parenText,
    };
  } else {
    // Fall back to space separation for models like "Gemini 2.0 Flash"
    const spaceParts = mainText.split(" ");
    return {
      mainText,
      firstPart: spaceParts[0]?.trim() ?? "",
      secondPart: spaceParts.slice(1).join(" ").trim(),
      parenText: parenText,
    };
  }
}
