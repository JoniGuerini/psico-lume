export const AUTH_SESSION_STORAGE_KEY = "lume-auth-session"

export type AuthSession =
  | { mode: "demo" }
  | { mode: "guest"; name: string }

export function readAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (parsed.mode === "demo") return { mode: "demo" }
    if (
      parsed.mode === "guest" &&
      typeof parsed.name === "string" &&
      parsed.name.trim().length > 0
    ) {
      return { mode: "guest", name: parsed.name.trim() }
    }
    return null
  } catch {
    return null
  }
}

export function persistAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}

export function authSessionToUser(session: AuthSession) {
  if (session.mode === "demo") {
    return {
      name: "Jonathan Guerini",
      email: "jonathan.guerini@example.com",
      avatar: "",
    }
  }

  return {
    name: session.name,
    email: "Conta local · neste navegador",
    avatar: "",
  }
}
