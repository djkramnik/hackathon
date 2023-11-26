chrome.tabs.onUpdated.addListener(handleTabUpdate)

let activeTabId = -1
const healthGovResultsPage = 'https://www.healthcare.gov/see-plans/#/plan/results'

function handleTabUpdate(_, changeInfo, tabData) {
  if (tabData.active !== true) {
    return
  }
  if (tabData.active === true) {
    if (typeof changeInfo.url === 'string') {
      if (changeInfo.url.startsWith(healthGovResultsPage)) {
        console.log('MAKE SCRIPT GO NOW', tabData.id)
        chrome.scripting.executeScript({
          target: {
            tabId: tabData.id,
          },
          files: ["healthgov.js"]
        })
      }
    }
  }
}