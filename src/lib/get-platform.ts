export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

export function getModifierKey(): string {
  return isMac() ? "⌘" : "Ctrl";
}
