/**
 * Temporary storage adapter — mirrors what PostgreSQL will do later.
 * All services use this instead of calling localStorage directly.
 */

export function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function generateId() {
  return crypto.randomUUID()
}
