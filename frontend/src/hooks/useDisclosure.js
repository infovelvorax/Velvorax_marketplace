import { useState, useCallback } from 'react'

/**
 * Custom hook for managing modal, drawer, or dropdown disclosure state
 * @param {boolean} initial
 */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle, setIsOpen }
}

export default useDisclosure
