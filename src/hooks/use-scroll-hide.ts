import { useState, useEffect } from 'react'

export function useScrollHide(idleTimeout = 1500) {
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }

      setLastScrollY(currentScrollY)

      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        setIsHidden(false)
      }, idleTimeout)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(idleTimer)
    }
  }, [lastScrollY, idleTimeout])

  return isHidden
}
