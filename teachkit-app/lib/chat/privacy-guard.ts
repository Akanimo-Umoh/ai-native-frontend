import "server-only"

/**
 * A simple, heuristic check for obvious personal details (email addresses and
 * phone-number-like digits). It reduces accidental sharing; it is not a complete
 * privacy filter. Student names, for example, cannot be detected this way.
 */
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
const NIGERIAN_PHONE = /(?:\+?234|\b0)[\s-]?[789][01]\d[\s-]?\d{3}[\s-]?\d{4}\b/
const LONG_NUMBER = /\b\d{11,}\b/

export function containsPersonalDetails(text: string): boolean {
  return EMAIL.test(text) || NIGERIAN_PHONE.test(text) || LONG_NUMBER.test(text)
}
