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
    // validate results here

    const updatePlanName = updateTextAreaRow(null, 0)
    const updateBenefits = updateTextAreaRow.bind(null, 4)
    const updatePlanId = updateTextArea(null, 5)
    const updatePlanType = updateTextArea(null, 6)
    const updateMetalTier = updateInput(null, 7)
    const updateRating = updateMuiSelect(null, 8)
    const updateMonthlyPrem = updateInput(null, 9)
    const updatePtc = updateInput(null, 10)
    const updateDeductible = updateInput(null, 11)
    const updateDrugDeductible = updateTextArea(null, 12)
    const updateOOPMax = updateInput(null, 14)
    const updateEmergency = updateTextArea(null, 16)
    const updateGenericDrugs = updateTextArea(null, 17)
    const updatePrimaryCare = updateTextArea(null, 18)
    const updateSpecialists = updateTextArea(null, 19)

    updatePlanName(['solar', 'link below'])
  })

  function updateMuiSelect(parentEl, value) {
    if (!parentEl) {
      return
    }

    const listbox = parentEl.querySelector('[aria-haspopup="listbox"]')
    const event = document.createEvent('MouseEvents')
    event.initEvent('mousedown', true, true)
    listbox.dispatchEvent(event)
  
    setTimeout(() => {
      document.querySelector(`[role="presentation"] .MuiList-root [data-value="${value}"]`).click()
    }, 1)
  }
  
  function updateTextArea(parentEl, values) {
    if (!parentEl) {
      return
    }
    if (Array.isArray(values)) {
      parentEl.querySelectorAll('textarea')?.forEach((el, index) => {
        el.value = values[index] ?? ''
      })
      return
    }
    parentEl.querySelector('textarea')?.value = values
  }
  
  function updateInput(parentEl, value) {
    parentEl?.querySelector('input')?.value = value
  }
  
  function findLabel(value) {
    return Array.from(document.querySelectorAll('[data-testid^="plan-option-table"] label'))
      .find(el => el.textContent === value)
  }
  
  // keep going up the dom calling a callback on each level that will return
  // { keepGoing: boolean, data: any }
  function recurseUpDom(el, callback) {
    if (el === null) {
      return null
    }
    const { keepGoing, data } = callback(el)
    if (keepGoing === false) {
      return data
    }
    return recurseUpDom(el?.parentNode ?? null, callback)
  }
  
  function getRowNumForSection(sectionLabel) {
    const label = findLabel(sectionLabel)
    if (label === undefined) {
      return null
    }
    return recurseUpDom(label, getRowNum)
  }
  
  // call this where there is the plan-option-table id
  function getRowNum(el) {
    const dataTestId = el.getAttribute('data-testid')
    if (dataTestId === null) {
      return { keepGoing: true, data: null}
    }
    const [, rowNum] = dataTestId.match(/plan-option-table-{(\d+),\d+}/) ?? []
    if (rowNum === undefined) {
      return { keepGoing: true, data: null }
    }
    const parsedRow = Number(rowNum)
  
    return {
      keepGoing: Number.isNaN(parsedRow),
      data: parsedRow
    }
  }

  // values is an array!
  function updateTextAreaRow(index, values) {
    updateTextArea(
      document.querySelector(`[data-testid="plan-option-table-{${index},1}"`),
      values,
    )
  }

  function updateSelectRow(index, value) {
    updateMuiSelect(
      document.querySelector(`[data-testid="plan-option-table-{${index},1}"`),
      value,
    )
  }

  function updateInputRow(index, value) {
    updateInput(
      document.querySelector(`[data-testid="plan-option-table-{${index},1}"`),
      value,
    )
  }
}

function updatePlan(colNum = 1) {
  const updatePlanName = updateTextAreaRow.bind(null, 0)
  const updateBenefits = updateTextAreaRow.bind(null, 4)
  const updatePlanId = updateTextArea.bind(null, 5)
  const updatePlanType = updateTextArea.bind(null, 6)
  const updateMetalTier = updateInput.bind(null, 7)
  const updateRating = updateMuiSelect.bind(null, 8)
  const updateMonthlyPrem = updateInput.bind(null, 9)
  const updatePtc = updateInput.bind(null, 10)
  const updateDeductible = updateInput.bind(null, 11)
  const updateDrugDeductible = updateTextArea.bind(null, 12)
  const updateOOPMax = updateInput.bind(null, 14)
  const updateEmergency = updateTextArea.bind(null, 16)
  const updateGenericDrugs = updateTextArea.bind(null, 17)
  const updatePrimaryCare = updateTextArea.bind(null, 18)
  const updateSpecialists = updateTextArea.bind(null, 19)

  updatePlanName(['solar', 'link below'])

  function updateMuiSelect(parentEl, value) {
    if (!parentEl) {
      return
    }

    const listbox = parentEl.querySelector('[aria-haspopup="listbox"]')
    const event = document.createEvent('MouseEvents')
    event.initEvent('mousedown', true, true)
    listbox.dispatchEvent(event)
  
    setTimeout(() => {
      document.querySelector(`[role="presentation"] .MuiList-root [data-value="${value}"]`).click()
    }, 1)
  }
  
  function updateTextArea(parentEl, values) {
    if (!parentEl) {
      return
    }
    if (Array.isArray(values)) {
      Array.from(parentEl.querySelectorAll('textarea')).forEach((el, index) => {
        el.value = values[index] ?? ''
      })
      return
    }
    const textArea = parentEl.querySelector('textarea')
    if (!textArea) {
      return
    }
    textArea.value = values
  }
  
  function updateInput(parentEl, value) {
    if (!parentEl) {
      return
    }
    const input = parentEl.querySelector('input')
    if (!input) {
      return
    }
    input.value = value
  }
  
  function findLabel(value) {
    return Array.from(document.querySelectorAll('[data-testid^="plan-option-table"] label'))
      .find(el => el.textContent === value)
  }
  
  // keep going up the dom calling a callback on each level that will return
  // { keepGoing: boolean, data: any }
  function recurseUpDom(el, callback) {
    if (el === null) {
      return null
    }
    const { keepGoing, data } = callback(el)
    if (keepGoing === false) {
      return data
    }
    return recurseUpDom(el?.parentNode ?? null, callback)
  }
  
  function getRowNumForSection(sectionLabel) {
    const label = findLabel(sectionLabel)
    if (label === undefined) {
      return null
    }
    return recurseUpDom(label, getRowNum)
  }
  
  // call this where there is the plan-option-table id
  function getRowNum(el) {
    const dataTestId = el.getAttribute('data-testid')
    if (dataTestId === null) {
      return { keepGoing: true, data: null}
    }
    const [, rowNum] = dataTestId.match(/plan-option-table-{(\d+),\d+}/) ?? []
    if (rowNum === undefined) {
      return { keepGoing: true, data: null }
    }
    const parsedRow = Number(rowNum)
  
    return {
      keepGoing: Number.isNaN(parsedRow),
      data: parsedRow
    }
  }

  // values is an array!
  function updateTextAreaRow(index, values) {
    console.log('gustab', index, values)
    updateTextArea(
      document.querySelector(`[data-testid="plan-option-table-{${index},${colNum}}"`),
      values,
    )
  }

  function updateSelectRow(index, value) {
    updateMuiSelect(
      document.querySelector(`[data-testid="plan-option-table-{${index},${colNum}}"`),
      value,
    )
  }

  function updateInputRow(index, value) {
    updateInput(
      document.querySelector(`[data-testid="plan-option-table-{${index},${colNum}}"`),
      value,
    )
  }
}




