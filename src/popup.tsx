import { CountButton } from "~features/count-button"
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/chrome-extension'

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
const EXTENSION_URL = chrome.runtime.getURL('.')

if (!PUBLISHABLE_KEY) {
  throw new Error('Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env.development file')
}

import "~style.css"

function IndexPopup() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={`${EXTENSION_URL}/popup.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
    >
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-16 plasmo-w-40">
        <header className="plasmo-w-full">
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <CountButton />
      </div>
    </ClerkProvider>
  )
}

export default IndexPopup
