import { useEffect, useRef } from 'react'

/**
 * Custom hook to detect clicks outside of a referenced DOM element.
 * @param {Function} handler - Callback when clicking outside
 * @param {boolean} active - Whether the listener is active
 * @returns {React.RefObject}
 */
export function useClickOutside(handler, active = true) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active) return

    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler, active])

  return ref
}

export default useClickOutside
