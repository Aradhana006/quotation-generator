import { useEffect, useState } from 'react'

function readStoredValue(key, initialValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  } catch {
    return initialValue
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
