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

async function updatePlan(colNum = 1) {
  const updatePlanName = updateTextAreaRow.bind(null, 0)
  const updateBenefits = updateTextAreaRow.bind(null, 4)
  const updatePlanId = updateTextAreaRow.bind(null, 5)
  const updatePlanType = updateTextAreaRow.bind(null, 6)
  const updateMetalTier = updateInputRow.bind(null, 7)
  const updateRating = updateSelectRow.bind(null, 8)
  const updateMonthlyPrem = updateInputRow.bind(null, 9)
  const updatePtc = updateInputRow.bind(null, 10)
  const updateDeductible = updateInputRow.bind(null, 11)
  const updateDrugDeductible = updateTextAreaRow.bind(null, 12)
  const updateOOPMax = updateInputRow.bind(null, 14)
  const updateEmergency = updateTextAreaRow.bind(null, 16)
  const updateGenericDrugs = updateTextAreaRow.bind(null, 17)
  const updatePrimaryCare = updateTextAreaRow.bind(null, 18)
  const updateSpecialists = updateTextAreaRow.bind(null, 19)

  updatePlanName(['as the spoke person', 'siren attack'])
  await sleep()
  doTasks([
    () => updateBenefits('https://youtube.ca'),
    () => updatePlanId('S1234-2345-1234'),
    () => updatePlanType('BAAAAARRRR'),
    () => updateMetalTier('Metal Gear!'),
    () => updateRating('3.0'),
    () => updateMonthlyPrem('1,000.00'),
    () => updatePtc('200.00'),
    () => updateDeductible('5,000.00'),
    () => updateOOPMax('160.00'),
    () => updateEmergency('Feeding trees'),
    () => updateGenericDrugs('Loopy enough'),
    () => updatePrimaryCare('James Dean'),
    () => updateSpecialists('A firm member'),
    () => updateDrugDeductible('car crash')
  ])
  
  // updatePlanName(['the movie', 'seven'])
  // updateRating('1.0')

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
      doTasks(
        Array.from(parentEl.querySelectorAll('textarea'))   
          .map((el, index) => {
            return () => updateInputValue(el, values[index])
          })
      )
      return
    }
    const textArea = parentEl.querySelector('textarea')
    if (!textArea) {
      return
    }
    updateInputValue(textArea, values)
  }
  
  function updateInput(parentEl, value) {
    if (!parentEl) {
      return
    }
    const input = parentEl.querySelector('input')
    if (!input) {
      return
    }
    updateInputValue(input, value)
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
//  https://stackoverflow.com/questions/16250464/trigger-change-event-when-the-input-value-changed-programmatically
  function updateInputValue(inputEl, newValue) {
    console.log('connective story', inputEl, newValue)
    const valueSetter = Object.getOwnPropertyDescriptor(inputEl, 'value').set;
    const prototype = Object.getPrototypeOf(inputEl);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(inputEl, newValue);
    } else {
        valueSetter.call(inputEl, newValue);
    }
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.blur()
  }

  // given an array of tasks, we want to do each with a setTimeout in between
  async function doTasks(tasks) {
    if (tasks.length === 0) {
      return
    }
    await sleep()
    setTimeout(() => {
      (tasks[tasks.length - 1])()
      doTasks(tasks.slice(0, -1))
    }, 1)
  }

  function sleep(timeout = 1000) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout)
    })
  }
}




