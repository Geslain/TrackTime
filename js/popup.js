import {getDate} from "./helpers.js"

let updateInterval

function formatTime(givenSeconds) {
  const dateObj = new Date(givenSeconds * 1000);
  const hours = dateObj.getUTCHours();
  const minutes = dateObj.getUTCMinutes();
  const seconds = dateObj.getSeconds();
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

function clearStorage() {
  chrome.storage.local.clear(() => console.info("Storage cleared"))
  if(updateInterval) updateInterval.clearInterval()
  return null
}

async function displayActivity() {
  const {sessions = {}} = await chrome.storage.local.get(["sessions"]) || {}
  const today = getDate()
  const session = sessions[today] || {}

  const list = Object.entries(session).sort(([_a,a],[_b,b]) => {
   return b.time - a.time
  }).map(([key, {time, favIconUrl}]) => {
    return `<li><img src="${favIconUrl}" alt="${key}">${key}: ${formatTime(time)}</li>`
  })

  document.querySelector('#session').innerHTML = list.toString().replace(/,/g, "")
}

// Launch session displays
(async function() {
  const clearStorageButton = document.getElementById("clear-storage")

  if(clearStorageButton) clearStorageButton.addEventListener("click", clearStorage)

  await displayActivity()
  updateInterval = setInterval(displayActivity, 1000)
})()






