chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })

let activeTabId = -1
const healthGovResultsPage = 'https://www.healthcare.gov/see-plans/#/plan/results'
const caribouPage =  'https://ha-dash.staging.caribouadvisors.com/report-types/clpg56fpk000cs612l439o5gc/plan-picker?type=marketplace'

function handleTabUpdate(_, changeInfo, tabData) {
  if (tabData.active !== true) {
    return
  }
  if (typeof changeInfo.url !== 'string') {
    return
  }

  console.log('you had any questions', changeInfo.url)
  if (changeInfo.url.startsWith(healthGovResultsPage)) {
    chrome.scripting.executeScript({
      target: {
        tabId: tabData.id,
      },
      func: injectHealthGovButtons
    })
    return
  }

  if (/\/report-types\/\w+\/plan-picker\?type=marketplace/.test(changeInfo.url)) {
    const { host } = new URL(changeInfo.url)
    if (!host.includes('caribouadvisors.com')) {
      return
    }
    chrome.scripting.executeScript({
      target: {
        tabId: tabData.id,
      },
      func: testOnCaribou,
    })

  }
}

function injectHealthGovButtons() {
  const planTitleClassName = `.pet-c-plan-title__issuer`

  setTimeout(() => {
    const planTitles = document.querySelectorAll(planTitleClassName)
    planTitles.forEach(el => {
      const button = document.createElement('button')
      button.innerHTML = 'Copy'
      button.style = 'margin-left: 24px'
      el.appendChild(button)
      button.addEventListener('click', (event) => {
        chrome.storage.session.set({test: event.target.parentNode.textContent})
      })
    })
  }, 5000)
}

function testOnCaribou() {
  console.log('aasaaa')
  chrome.storage.session.get('test', function (result) {
    console.log('TESTING THIS YO', result)
  })
}