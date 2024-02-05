import {getDate} from "./helpers.js"

let timerInterval

async function startTimer() {
  const {sessions = {}} = await chrome.storage.local.get(["sessions"])
  const today = getDate()
  const session = sessions[today] || {}

  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

  let hostnameMatch = new RegExp(/(?:\w+\.)+\w+/).exec(tab.url)
  let hostname = hostnameMatch && hostnameMatch.length ? hostnameMatch[0] : undefined

  if (!hostname) return

  timerInterval = setInterval(async () => {
    const sessionObject = {
      time: typeof session[hostname] === "undefined" ? 0 : session[hostname].time + 1
    }

    if (!sessionObject["favIconUrl"]) sessionObject["favIconUrl"] = tab.favIconUrl
    session[hostname] = sessionObject
    sessions[today] = session
    await chrome.storage.local.set({sessions}).then(() => {
      console.log("Sessions is updated");
    });
  }, 1000)
}

(async function () {
  chrome.tabs.onActivated.addListener(async function () {
    if (timerInterval) clearInterval(timerInterval)
    await startTimer()
  })

  chrome.windows.onFocusChanged.addListener(async function (window) {
    if (window === chrome.windows.WINDOW_ID_NONE) {
      if (timerInterval) clearInterval(timerInterval)
    } else {
      await startTimer()
    }
  });
})()
