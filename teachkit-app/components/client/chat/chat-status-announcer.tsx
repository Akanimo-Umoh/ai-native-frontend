/**
 * Visually hidden live region. Screen readers announce changes to its text politely.
 * Only short state changes go here ("Assistant is thinking", "Response complete"),
 * never the streamed text itself, which would be unusable token by token.
 */
export function ChatStatusAnnouncer({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}
