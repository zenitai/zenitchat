interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-900 dark:text-red-400"
      role="alert"
    >
      <div className="leading-relaxed">
        <span>{message}</span>
      </div>
    </div>
  );
}
