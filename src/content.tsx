import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

interface Shortcut {
  isModifiers: {
    isControl: boolean
    isShift: boolean
    isAlt: boolean
    isMeta: boolean
  }
  key: string
  uniqueIdentifier: string
  isRelativeToScrollItem: boolean
}

interface WebSubURLShortcut {
  hrefRegex: string
  shortcuts: Shortcut[]
  scrollBoxIdentifier: string
}

const PlasmoContent = () => {
  const storage = new Storage()
  const [scrollItem, setScrollItem] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const setDefaultShortcuts = async () => {
      const existingShortcuts = await storage.get<WebSubURLShortcut[]>("shortcuts");
      if (!existingShortcuts || existingShortcuts.length === 0) {
        const defaultShortcuts: WebSubURLShortcut[] = [
          {
            hrefRegex: "https:\\/\\/mail\\.google\\.com\\/mail\\/u\\/\\d+\\/.+",
            shortcuts: [],
            scrollBoxIdentifier: "div>div>table>tbody"
          }
        ];
        await storage.set("shortcuts", defaultShortcuts);
      }
      const existingVimStyle = await storage.get<boolean>("vimStyle");
      if (existingVimStyle === undefined) {
        await storage.set("vimStyle", true);
      }
    };

    setDefaultShortcuts();
  }, []);

  // Handle shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const shortcuts = await storage.get<WebSubURLShortcut[]>("shortcuts") || [];
      const isVimStyle = await storage.get<boolean>("vimStyle") || false;
      const currentURLShortcuts = shortcuts.filter(s => new RegExp(s.hrefRegex).test(window.location.href));
      if (currentURLShortcuts.length === 0) return;
      
      if ((isVimStyle && (e.key === "j" || e.key === "k")) || (!isVimStyle && (e.key === "ArrowDown" || e.key === "ArrowUp"))) {
        const scrollBoxIdentifier = currentURLShortcuts[0].scrollBoxIdentifier;
        const scrollBox = document.querySelector(scrollBoxIdentifier) as HTMLElement;
        if (scrollBox) {
          e.preventDefault();
          if (!scrollItem) {
            setScrollItem(scrollBox.firstElementChild as HTMLElement);
          } else {
            const nextItem = e.key === "j" || e.key === "ArrowDown" ? scrollItem.nextElementSibling : scrollItem.previousElementSibling;
            if (nextItem) {
              setScrollItem(nextItem as HTMLElement);
              nextItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }
        }
        return;
      }

      currentURLShortcuts[0].shortcuts.forEach((shortcut) => {
        const targetElement = (shortcut.isRelativeToScrollItem ? scrollItem : document).querySelector(shortcut.uniqueIdentifier) as HTMLElement;
        if (targetElement && typeof targetElement.click === "function") {
          const isModifiers = {
            isControl: e.ctrlKey,
            isShift: e.shiftKey,
            isAlt: e.altKey,
            isMeta: e.metaKey
          }
          if (shortcut.key.toUpperCase() === e.key.toUpperCase() && 
              shortcut.isModifiers.isControl === isModifiers.isControl &&
              shortcut.isModifiers.isShift === isModifiers.isShift &&
              shortcut.isModifiers.isAlt === isModifiers.isAlt &&
              shortcut.isModifiers.isMeta === isModifiers.isMeta) {
            e.preventDefault();
            targetElement.click();
          }
        }
      });
    }

    document.addEventListener("keydown", handleKeyDown)
    // return () => document.removeEventListener("keydown", handleKeyDown)
  }, [scrollItem])

  useEffect(() => {
    if (scrollItem) {
      // scrollItem.style.backgroundColor = "#333"; // Darker background
      scrollItem.style.border = "2px solid #555"; // Border
    }

    return () => {
      if (scrollItem) {
        // scrollItem.style.backgroundColor = ""; // Reset background
        scrollItem.style.border = ""; // Reset border
      }
    };
  }, [scrollItem]);

  return null
}

export default PlasmoContent
