/** A reply that starts with this marker is shown as a "declined" notice, not as a normal message. */
export const DECLINE_MARKER = "[[DECLINED]]"

export const STORAGE_KEYS = {
  history: "teachkit:chat:v1",
  feedback: "teachkit:chat-feedback:v1",
} as const

/** Request header used by the demo state simulator. It never reaches the AI model. */
export const SIMULATE_HEADER = "x-simulate"
