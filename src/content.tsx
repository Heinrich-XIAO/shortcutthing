import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

interface Shortcut {
  domain: string
  isModifiers: {
    isControl: boolean
    isShift: boolean
    isAlt: boolean
    isMeta: boolean
  }
  shortcut: string
  uniqueIdentifier: string
}

const PlasmoContent = () => {
  const storage = new Storage()

  // Handle shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const shortcuts = await storage.get<Shortcut[]>("shortcuts") || []
      const isModifiers = {
        isControl: e.ctrlKey,
        isShift: e.shiftKey,
        isAlt: e.altKey,
        isMeta: e.metaKey
      }
      const shortcut = e.key.toUpperCase()

      const matchingShortcuts = shortcuts.filter(s =>
        s.domain === window.location.hostname &&
        s.shortcut === shortcut &&
        s.isModifiers.isControl === isModifiers.isControl &&
        s.isModifiers.isShift === isModifiers.isShift &&
        s.isModifiers.isAlt === isModifiers.isAlt &&
        s.isModifiers.isMeta === isModifiers.isMeta
      )

      if (matchingShortcuts.length > 0) {
        for (const matchingShortcut of matchingShortcuts) {
          const targetElement = document.querySelector(matchingShortcut.uniqueIdentifier) as HTMLElement
          if (targetElement && typeof targetElement.click === "function") {
            targetElement.click()
            break
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return null
}

export default PlasmoContent
