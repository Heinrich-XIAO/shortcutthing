import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
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

interface DialogProps {
  message: string
  onClose: (action: "replace" | "keep" | "cancel") => void
}

const ConfirmDialog: React.FC<DialogProps> = ({ message, onClose }) => (
  <dialog open className="plasmo-fixed plasmo-z-[10002] plasmo-p-4 plasmo-rounded plasmo-bg-white plasmo-shadow-lg">
    <p className="plasmo-text-lg plasmo-mb-4">{message}</p>
    <div className="plasmo-flex plasmo-gap-2 plasmo-mt-4">
      <button 
        onClick={() => onClose("replace")}
        className="plasmo-bg-green-500 plasmo-border-none plasmo-text-white plasmo-py-2 plasmo-px-4 plasmo-text-center plasmo-no-underline plasmo-inline-block plasmo-text-base plasmo-m-1 plasmo-cursor-pointer plasmo-rounded hover:plasmo-bg-green-600"
      >
        Replace
      </button>
      <button 
        onClick={() => onClose("keep")}
        className="plasmo-bg-green-500 plasmo-border-none plasmo-text-white plasmo-py-2 plasmo-px-4 plasmo-text-center plasmo-no-underline plasmo-inline-block plasmo-text-base plasmo-m-1 plasmo-cursor-pointer plasmo-rounded hover:plasmo-bg-green-600"
      >
        Keep Both
      </button>
      <button 
        onClick={() => onClose("cancel")}
        className="plasmo-bg-gray-500 plasmo-border-none plasmo-text-white plasmo-py-2 plasmo-px-4 plasmo-text-center plasmo-no-underline plasmo-inline-block plasmo-text-base plasmo-m-1 plasmo-cursor-pointer plasmo-rounded hover:plasmo-bg-gray-600"
      >
        Cancel
      </button>
    </div>
  </dialog>
)

const ShortcutInput: React.FC<{
  onConfirm: (shortcut: string, modifiers: Shortcut["isModifiers"]) => void
  onCancel: () => void
}> = ({ onConfirm, onCancel }) => {
  const [shortcut, setShortcut] = useState("")
  const [modifiers, setModifiers] = useState<Shortcut["isModifiers"]>({
    isControl: false,
    isShift: false,
    isAlt: false,
    isMeta: false
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.key === "Escape") {
        if (["", "CONTROL", "SHIFT", "META", "ALT"].includes(shortcut)) {
          alert("Shortcut not complete.")
          return
        }
        onConfirm(shortcut, modifiers)
        return
      }

      setModifiers({
        isControl: e.ctrlKey,
        isShift: e.shiftKey,
        isAlt: e.altKey,
        isMeta: e.metaKey
      })
      setShortcut(e.key.toUpperCase())
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcut, modifiers])

  return (
    <div className="plasmo-fixed plasmo-top-1/2 plasmo-left-1/2 plasmo-transform plasmo--translate-x-1/2 plasmo--translate-y-1/2 plasmo-z-[10001] plasmo-bg-white plasmo-p-8 plasmo-rounded-lg plasmo-shadow-lg plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center">
      <p className="plasmo-text-lg plasmo-mb-4 plasmo-text-center">Type the shortcut you want to assign to this button. Press Escape to confirm.</p>
      <div className="plasmo-flex plasmo-gap-2 plasmo-mt-4 plasmo-justify-center">
        {Object.entries(modifiers).map(([key, value]) => 
          value && (
            <kbd key={key} className="plasmo-px-2 plasmo-py-1 plasmo-bg-gray-100 plasmo-rounded plasmo-text-sm plasmo-font-mono">
              {key.replace("is", "")}
            </kbd>
          )
        )}
        {!["CONTROL", "SHIFT", "META", "ALT"].includes(shortcut) && shortcut && (
          <kbd className="plasmo-px-2 plasmo-py-1 plasmo-bg-gray-100 plasmo-rounded plasmo-text-sm plasmo-font-mono">
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  )
}

const PlasmoContent = () => {
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  const [showShortcutInput, setShowShortcutInput] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")
  const [pendingShortcut, setPendingShortcut] = useState<Partial<Shortcut> | null>(null)
  
  const storage = new Storage()

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "S" && !hasSearched) {
        setHasSearched(true)
        alert("Click on the element you want to assign a shortcut to.")
      }
    }

    const handleClick = async (e: MouseEvent) => {
      if (!hasSearched) return

      e.preventDefault()
      e.stopPropagation()

      const element = e.target as HTMLElement
      let currentElement: HTMLElement | null = element
      let isClickable = false

      while (currentElement) {
        if (typeof currentElement.click === "function") {
          isClickable = true
          break
        }
        currentElement = currentElement.parentElement
      }

      if (!isClickable) {
        alert("The selected element or its ancestors are not clickable.")
        setHasSearched(false)
        return
      }

      const ancestry: string[] = []
      currentElement = element
      while (currentElement?.parentElement) {
        const tagName = currentElement.tagName.toLowerCase()
        const id = currentElement.id ? `#${currentElement.id.trim()}` : ""
        ancestry.unshift(`${tagName}${id}`)
        currentElement = currentElement.parentElement
      }

      setSelectedElement(element)
      element.style.setProperty("border", "2px solid red", "important")
      setShowShortcutInput(true)
      setHasSearched(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    if (hasSearched) {
      document.addEventListener("mousedown", handleClick, { once: true })
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (hasSearched) {
        document.removeEventListener("mousedown", handleClick)
      }
    }
  }, [hasSearched])

  const handleShortcutConfirm = async (shortcut: string, modifiers: Shortcut["isModifiers"]) => {
    if (!selectedElement) return

    const shortcuts = await storage.get<Shortcut[]>("shortcuts") || []
    const existingShortcut = shortcuts.find(s =>
      s.domain === window.location.hostname &&
      s.shortcut === shortcut &&
      s.isModifiers.isControl === modifiers.isControl &&
      s.isModifiers.isShift === modifiers.isShift &&
      s.isModifiers.isAlt === modifiers.isAlt &&
      s.isModifiers.isMeta === modifiers.isMeta
    )

    if (existingShortcut) {
      const modifierText = Object.entries(modifiers)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace("is", ""))
        .join("+")
      setDialogMessage(
        `A shortcut for "${modifierText}${modifierText ? "+" : ""}${shortcut}" already exists for this domain. Choose an action:`
      )
      setShowDialog(true)
      setPendingShortcut({
        domain: window.location.hostname,
        isModifiers: modifiers,
        shortcut,
        uniqueIdentifier: selectedElement.id
      })
      return
    }

    await saveShortcut(shortcut, modifiers, "keep")
  }

  const saveShortcut = async (
    shortcut: string,
    modifiers: Shortcut["isModifiers"],
    action: "replace" | "keep"
  ) => {
    if (!selectedElement || !pendingShortcut) return

    const shortcuts = await storage.get<Shortcut[]>("shortcuts") || []
    let updatedShortcuts = [...shortcuts]

    if (action === "replace") {
      updatedShortcuts = shortcuts.filter(s =>
        !(s.domain === window.location.hostname &&
          s.shortcut === shortcut &&
          s.isModifiers.isControl === modifiers.isControl &&
          s.isModifiers.isShift === modifiers.isShift &&
          s.isModifiers.isAlt === modifiers.isAlt &&
          s.isModifiers.isMeta === modifiers.isMeta)
      )
    }

    const newShortcut: Shortcut = {
      domain: window.location.hostname,
      isModifiers: modifiers,
      shortcut,
      uniqueIdentifier: selectedElement.id
    }

    await storage.set("shortcuts", [...updatedShortcuts, newShortcut])
    
    selectedElement.style.removeProperty("border")
    setSelectedElement(null)
    setShowShortcutInput(false)
    setPendingShortcut(null)
  }

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

  return (
    <>
      {showShortcutInput && (
        <ShortcutInput
          onConfirm={handleShortcutConfirm}
          onCancel={() => {
            if (selectedElement) {
              selectedElement.style.removeProperty("border")
              setSelectedElement(null)
            }
            setShowShortcutInput(false)
          }}
        />
      )}
      {showDialog && (
        <ConfirmDialog
          message={dialogMessage}
          onClose={async (action) => {
            setShowDialog(false)
            if (action === "cancel") {
              if (selectedElement) {
                selectedElement.style.removeProperty("border")
                setSelectedElement(null)
              }
              setShowShortcutInput(false)
              setPendingShortcut(null)
              return
            }
            if (pendingShortcut?.isModifiers && pendingShortcut.shortcut) {
              await saveShortcut(pendingShortcut.shortcut, pendingShortcut.isModifiers, action)
            }
          }}
        />
      )}
    </>
  )
}

export default PlasmoContent
