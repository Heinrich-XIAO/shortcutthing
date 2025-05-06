import { useEffect } from "react"

function Popup() {
  useEffect(() => {
    chrome.runtime.openOptionsPage()
  }, [])

  return <span>Opening options…</span>
}

export default Popup

