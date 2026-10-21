"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react"
import { z } from "zod"
import { STORAGE_KEYS } from "@/lib/chat/constants"
import { CHAT_LIMITS } from "@/lib/chat/limits"
import { getMessageText } from "@/lib/chat/message-utils"
import type { ChatFeedback, ChatStatus, ChatUIMessage } from "@/types/chat"

/**
 * Saves the conversation and feedback in this browser (localStorage).
 * Only compact text is stored, it is validated when read back, and it is capped
 * in size. Nothing is sent to a server. The Clear button removes it all.
 */

const storedMessagesSchema = z.array(
  z.object({
    id: z.string().min(1),
    role: z.enum(["user", "assistant"]),
    text: z.string(),
  })
)
const storedFeedbackSchema = z.record(z.string(), z.enum(["up", "down"]))

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null // storage unavailable (private mode, blocked): behave as empty
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Storage full or unavailable: the chat still works, it just won't persist.
  }
}

function readStoredMessages(): ChatUIMessage[] {
  const raw = readStorage(STORAGE_KEYS.history)
  if (!raw) return []
  try {
    const parsed = storedMessagesSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return []
    return parsed.data.slice(-CHAT_LIMITS.maxStoredMessages).map((message) => ({
      id: message.id,
      role: message.role,
      parts: [{ type: "text" as const, text: message.text }],
    }))
  } catch {
    return []
  }
}

function toStored(messages: ChatUIMessage[]) {
  return messages
    .filter(
      (message) => message.role === "user" || message.role === "assistant"
    )
    .map((message) => ({
      id: message.id,
      role: message.role,
      text: getMessageText(message),
    }))
    .filter((message) => message.text !== "")
    .slice(-CHAT_LIMITS.maxStoredMessages)
}

// Feedback lives in an external store so React can read it safely on the client
// without a server/client mismatch during the first render.
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function getFeedbackSnapshot() {
  return readStorage(STORAGE_KEYS.feedback) ?? ""
}

function getServerSnapshot() {
  return ""
}

function parseFeedback(raw: string): Record<string, ChatFeedback> {
  if (!raw) return {}
  try {
    const parsed = storedFeedbackSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : {}
  } catch {
    return {}
  }
}

type Params = {
  messages: ChatUIMessage[]
  setMessages: (messages: ChatUIMessage[]) => void
  status: ChatStatus
}

export function useChatHistory({ messages, setMessages, status }: Params) {
  const skipNextSave = useRef(false)

  // Restore once on mount.
  useEffect(() => {
    const stored = readStoredMessages()
    if (stored.length > 0) {
      skipNextSave.current = true // don't overwrite storage with the still-empty list
      setMessages(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  // Save when a turn finishes (not on every streamed token).
  useEffect(() => {
    if (status === "submitted" || status === "streaming") return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    writeStorage(STORAGE_KEYS.history, JSON.stringify(toStored(messages)))
  }, [messages, status])

  const rawFeedback = useSyncExternalStore(
    subscribe,
    getFeedbackSnapshot,
    getServerSnapshot
  )
  const feedback = useMemo(() => parseFeedback(rawFeedback), [rawFeedback])

  const setFeedback = useCallback(
    (messageId: string, value: ChatFeedback | null) => {
      const next = { ...parseFeedback(getFeedbackSnapshot()) }
      if (value === null) delete next[messageId]
      else next[messageId] = value
      writeStorage(STORAGE_KEYS.feedback, JSON.stringify(next))
      emit()
    },
    []
  )

  const clearHistory = useCallback(() => {
    setMessages([])
    writeStorage(STORAGE_KEYS.history, null)
    writeStorage(STORAGE_KEYS.feedback, null)
    emit()
  }, [setMessages])

  return { feedback, setFeedback, clearHistory }
}
