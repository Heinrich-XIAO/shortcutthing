import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/chrome-extension'
import { useEffect, useState } from "react"
import JSON5 from 'json5';

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

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
const EXTENSION_URL = chrome.runtime.getURL('.')

if (!PUBLISHABLE_KEY) {
  throw new Error('Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env.development file')
}

import "~style.css"

function IndexOptions() {
  const [shortcuts, setShortcut] = useState<WebSubURLShortcut[]>();

  useEffect(() => {
    const thing = async () => {
        const res = await fetch(`https://shortcutthingbackend.netlify.app/.netlify/functions/getShortcuts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const body = await res.json();
        console.log(body.shortcuts)
        setShortcut(body.shortcuts);
    };
    thing();
  }, [])
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={`${EXTENSION_URL}/popup.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
    >
      <div className="">
        <header className="flex justify-between items-center p-2 border-b">
            <div className="flex items-center gap-2">
                <img src="/icon.png" alt="ShortcutThing Logo" className="w-8 h-8" />
                <h1 className="text-xl font-semibold text-gray-800">ShortcutThing</h1>
            </div>
            <div>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="px-4 py-2 text-black border-2 rounded-lg hover:bg-gray-200 transition">Sign In</button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton afterSignOutUrl={`${EXTENSION_URL}/popup.html`} />
                </SignedIn>
            </div>
        </header>
            <main className="text-center p-4">
            {shortcuts === undefined ? (
                <p className="text-gray-500">Loading shortcuts...</p>
            ) : shortcuts.length === 0 ? (
                <p className="text-gray-500">No shortcuts found.</p>
            ) : (
                <div className="space-y-6">
                {shortcuts.map((entry) => (
                    <div
                    key={entry.uuid}
                    className="border p-4 rounded-lg text-left bg-white shadow"
                    >
                    <h2 className="text-lg font-bold text-gray-800">
                        Pattern: <span className="font-mono text-blue-600">{entry.hrefRegex}</span>
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                        Scroll Box: <code className="font-mono">{entry.scrollBoxIdentifier}</code>
                    </p>
                    <div className="space-y-2">
                        {entry.shortcuts.map((s, i) => (
                        <div
                            key={i}
                            className="border rounded px-3 py-2 bg-gray-50"
                        >
                            <p className="text-sm text-gray-800">
                            <span className="font-semibold">Key:</span> <code className="font-mono">{s.key}</code>
                            </p>
                            <p className="text-sm text-gray-800">
                            <span className="font-semibold">Modifiers:</span>{" "}
                            {Object.entries(s.isModifiers)
                                .filter(([, v]) => v)
                                .map(([k]) => k.replace("is", ""))
                                .join(" + ") || "None"}
                            </p>
                            <p className="text-sm text-gray-800">
                            <span className="font-semibold">Visible:</span> {s.mustBeVisible ? "Yes" : "No"} |{" "}
                            <span className="font-semibold">Relative to Scroll:</span> {s.isRelativeToScrollItem ? "Yes" : "No"}
                            </p>
                        </div>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            )}
            </main>

    </div>
    </ClerkProvider>
  )
}

export default IndexOptions
