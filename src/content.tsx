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
  mustBeVisible: boolean
}

interface WebSubURLShortcut {
  uuid: string
  hrefRegex: string
  shortcuts: Shortcut[]
  scrollBoxIdentifier: string
}

const getShortcutsFromUUID = async (uuid: string): Promise<WebSubURLShortcut[]> => {
  const res = await fetch(`https://shortcutthingbackend.netlify.app/.netlify/functions/redisConnect?uuid=${uuid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
  const body = await res.json();
  return body.shortcut;
}

const PlasmoContent = () => {
  const storage = new Storage()
  const [scrollItem, setScrollItem] = useState<HTMLElement | null>(null);
  const [backupScrollItems, setBackupScrollItems] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const setDefaultShortcuts = async () => {
      const existingShortcuts = await storage.get<WebSubURLShortcut[]>("shortcuts");
      if (!existingShortcuts || existingShortcuts.length === 0) {
        const defaultUUID = "99365813-73b4-4c23-8cd5-0222916161be";
        const defaultShortcuts = await getShortcutsFromUUID(defaultUUID);
        await storage.set("shortcuts", [defaultShortcuts]);
      }
      const existingVimStyle = await storage.get<boolean>("vimStyle");
      if (existingVimStyle === undefined) {
        await storage.set("vimStyle", true);
      }
    };

    setDefaultShortcuts();
  }, []);

  useEffect(() => {
    const syncShortcuts = async () => {
      const shortcuts = await storage.get<WebSubURLShortcut[]>("shortcuts") || [];
      const newShortcuts = [];
      for (let i = 0; i < shortcuts.length; i++) {
        const shortcut = shortcuts[i];
        if (shortcut.uuid) {
          const newShortcut = await getShortcutsFromUUID(shortcut.uuid);
          newShortcuts.push(newShortcut);
        }
      }
      await storage.set("shortcuts", newShortcuts);
    };

    syncShortcuts();
  }, []);

  useEffect(() => {
		const isVisible = (element) => {
			if (!element) return false;

			if (!document.body.contains(element)) return false;

			let current = element;
			while (current) {
				const style = getComputedStyle(current);
				if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
					return false;
				}
				current = current.parentElement;
			}

			return true;
		};
    const setBackupScrollItemsWithCurrent = (currentItem: HTMLElement | null) => { 
      const backupScrollItems = [];
      backupScrollItems.push(currentItem.nextElementSibling as HTMLElement);
      backupScrollItems.push(currentItem.previousElementSibling as HTMLElement);
      setBackupScrollItems(backupScrollItems);
    }
    const handleBackups = () => {
      if (scrollItem && !document.body.contains(scrollItem as Node)) {
        // Set to the first element in backups that is in the document
        const nextItem = backupScrollItems.find(item => document.body.contains(item as Node)) as HTMLElement;
        setScrollItem(nextItem);
        nextItem.style.border = "2px solid #555";
        setBackupScrollItems(backupScrollItems.filter(item => document.body.contains(item as Node)));
        setBackupScrollItemsWithCurrent(nextItem);
        return;
      }
    }
    const handleKeyDown = async (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTextInput = active && (
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        (active as HTMLElement).isContentEditable
      );
      const hasCtrlAltOrMeta = e.ctrlKey || e.altKey || e.metaKey;
      if (isTextInput && !hasCtrlAltOrMeta) {
        return;
      }
      const shortcuts = await storage.get<WebSubURLShortcut[]>("shortcuts") || [];
      const isVimStyle = await storage.get<boolean>("vimStyle") || false;
      const currentURLShortcuts = shortcuts.filter(s => new RegExp(s.hrefRegex).test(window.location.href));
      if (currentURLShortcuts.length === 0) return;
      
      if ((isVimStyle && (e.key === "j" || e.key === "k")) || (!isVimStyle && (e.key === "ArrowDown" || e.key === "ArrowUp"))) {
        const scrollBoxIdentifier = currentURLShortcuts[0].scrollBoxIdentifier;
        const scrollBox = document.querySelector(scrollBoxIdentifier) as HTMLElement;
        if (scrollBox) {
          e.preventDefault();
          let nextItem: HTMLElement | null = null;
          if (!scrollItem || !document.body.contains(scrollItem as Node)) {
            nextItem = scrollBox.firstElementChild as HTMLElement;
            setScrollItem(nextItem);
            (nextItem).style.border = "2px solid #555";
            scrollBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
          } else {
            nextItem = e.key === "j" || e.key === "ArrowDown" ? scrollItem.nextElementSibling as HTMLElement : scrollItem.previousElementSibling as HTMLElement;
            if (nextItem) {
              setScrollItem(nextItem as HTMLElement);
              nextItem.scrollIntoView({ behavior: "auto", block: "nearest" });
              (nextItem as HTMLElement).style.border = "2px solid #555";
              scrollItem.style.border = "";
            }
          }
          setBackupScrollItemsWithCurrent(nextItem);
        }
        return;
      }

      currentURLShortcuts[0].shortcuts.forEach(async (shortcut) => {
        if (shortcut.isRelativeToScrollItem && !scrollItem) {
          return;
        }
				const matchingElements = (shortcut.isRelativeToScrollItem ? scrollItem : document).querySelectorAll(shortcut.uniqueIdentifier);
        console.log("matchingElements", matchingElements);
        const visibleElements = Array.from(matchingElements).filter(element => isVisible(element));  
        const targetElement = (shortcut.mustBeVisible ? visibleElements : matchingElements)[0] as HTMLElement;
        console.log("targetElement", targetElement);
        if (targetElement) {
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

            const clickEvent = new MouseEvent("click", {
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            targetElement.dispatchEvent(clickEvent);

            const mouseDownEvent = new MouseEvent("mousedown", {
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            targetElement.dispatchEvent(mouseDownEvent);

						await	new Promise(resolve => setTimeout(resolve, 10));

						const mouseUpEvent = new MouseEvent("mouseup", {
								"view": window,
								"bubbles": true,
								"cancelable": false
						});
						targetElement.dispatchEvent(mouseUpEvent);
          }
        }
      });

      handleBackups();
    }

    document.addEventListener("keydown", handleKeyDown)

    const observer = new MutationObserver(() => {
      handleBackups();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      observer.disconnect();
    }
  }, [scrollItem])

  return null
}

export default PlasmoContent
