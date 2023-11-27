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
        const searchResult = el?.parentNode?.parentNode ?? el
        const carrierName = 
          (searchResult.querySelector('.pet-c-plan-title__issuer')?.textContent ?? '')
          .replace('Copy', '')
        const planName = searchResult.querySelector('.pet-c-plan-title__name')?.textContent ?? ''
        const info = searchResult.querySelector('.pet-c-plan-title__info')
        const metalLevel = info?.querySelector('[aria-label="Metal Level"]').textContent ?? ''
        const planType = info?.querySelector('[aria-label="Plan type"]').textContent ?? ''
        const planId = info?.querySelector('[aria-label="Plan ID"]').textContent ?? ''
        const rating = info?.querySelector('.ds-c-icon--star ')?.parentNode?.querySelector('.ds-u-visibility--screen-reader').textContent ?? ''
        const premium = searchResult.querySelector(`[aria-labelledby="${planId}-premium-label"]`)?.textContent ?? ''
        const [
          ,
          deductibleEl,
          oopEl,
        ] = searchResult.querySelectorAll('.pet-c-plan-cost-row .pet-c-plan__currency-container')
        const benefits = Array.from(searchResult.querySelectorAll('.pet-c-plan-benefit-name'))
        const primaryCare = benefits.find(el => el.textContent === 'Primary care')
        const specialistCare = benefits.find(el => el.textContent === 'Specialist care')
        const emergencyRoom = benefits.find(el => el.textContent === 'Emergency room')
        const genericDrugs = benefits.find(el => el.textContent === 'Generic drugs')

        const result = {
          carrierName,
          planName,
          metalLevel,
          planType,
          planId,
          rating,
          premium,
          deductible: deductibleEl?.textContent ?? '',
          oop: oopEl?.textContent ?? '',
          primaryCare: primaryCare
            ? primaryCare.parentNode.querySelector('.pet-c-plan-benefit-cost')?.textContent ?? ''
            : '',
          specialistCare: specialistCare
            ? specialistCare.parentNode.querySelector('.pet-c-plan-benefit-cost')?.textContent ?? ''
            : '',
          emergencyRoom: emergencyRoom
            ? emergencyRoom.parentNode.querySelector('.pet-c-plan-benefit-cost')?.textContent ?? ''
            : '',
          genericDrugs: genericDrugs
            ? genericDrugs.parentNode.querySelector('.pet-c-plan-benefit-cost')?.textContent ?? ''
            : '',
        }
        console.log(JSON.stringify(result))
        chrome.storage.session.set({test: result})
      })
    })
  }, 5000)
}

function testOnCaribou(tabId) {
  const ungaBugaVersion = '1.5'
  console.log('unba bunga version ', ungaBugaVersion)
  chrome.storage.session.get('test', result => {
    console.log('a lot of strain!!!', result.test)
    window.demo = result.test
    console.log('flute music', window.demo, window.location.href)


        // validate results here
    //console.log('TESTING THIS YO?????', result, typeof result)

    // need to stop doing this after navigation? or an if statement
   function opportunisticallyInjectButton() {
    ;[1,2,3,4].forEach((col) => {
      
      const planNameInputsContainer = document.querySelector(`[data-testid="plan-option-table-{0,${col}}"]`)
      const buttonId = `paste-extension-data-${col}`
      
      if (amIOnTheRightPage() !== true) {
        return
      }
      if (!planNameInputsContainer || planNameInputsContainer.querySelector(`#${buttonId}`)) {
        return
      }
      
      // put a button there with the specific id
      const button = document.createElement('button')
      button.innerHTML = 'Paste'
      button.setAttribute('id', buttonId)
      button.style=[
        'margin-left:25px',
        'margin-top:10px',
        'border-radius:16px',
        'outline:none',
        'border:none',
        'cursor:pointer',
        'font-family:Eina04-Bold',
        'font-size:15px',
        'line-height:1.5',
        'color:rgb(1,15,22)',
        'background-color:rgb(221, 222, 223)',
        'min-height:30px',
        'padding:5px 15px',
        'border-radius:16px',
        'width:fit-content',
      ].join(';')
      button.addEventListener('click', () => {
        console.log('one day you will be invoked as function arguments', window.demo)
        updatePlan(col, window.demo)
      })
      planNameInputsContainer.prepend(button)
    })
    
    if (amIOnTheRightPage()) {
      // I'll do it again
      setTimeout(opportunisticallyInjectButton, 1000)
    }
   }

  opportunisticallyInjectButton()

  function amIOnTheRightPage() {
    return /\/report-types\/\w+\/plan-picker\?type=marketplace/.test(window.location.href)
  }
  // this will have to return a promise, with the loading screen and what not
  async function updatePlan(colNum = 1, data) {
    if (!data) {
      console.log('no data to paste')
      return
    }
    console.log('pasting thine data', data)
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
    const updateEmergency = updateTextAreaRow.bind(null, 17)
    const updateGenericDrugs = updateTextAreaRow.bind(null, 18)
    const updatePrimaryCare = updateTextAreaRow.bind(null, 19)
    const updateSpecialists = updateTextAreaRow.bind(null, 20)

    updatePlanName([data.planName, data.carrierName])
    await sleep(3000)
    doTasks([
      () => updateBenefits(''),
      () => updatePlanId(data.planId),
      () => updatePlanType(data.planType),
      () => updateMetalTier(data.metalLevel),
      () => updateRating(parseRating(data.rating)),
      () => updateMonthlyPrem(parseCost(data.premium)),
      () => updatePtc('0'),
      () => updateDeductible(parseCost(data.deductible)),
      () => updateOOPMax(parseCost(data.oop)),
      () => updateEmergency(data.emergencyRoom),
      () => updateGenericDrugs(data.genericDrugs),
      () => updatePrimaryCare(data.primaryCare),
      () => updateSpecialists(data.specialistCare),
      () => updateDrugDeductible('Included in deductible')
    ])

    function parseCost(cost) {
      if (!cost) {
        return ''
      }
      return cost.replace('$', '')
        .replace('/month', '')
        .replace('Individual total', '')
        .replace('Family total', '')
    }

    function parseRating(rating) {
      if (!rating) {
        return ''
      }
      const [, numStars] = rating.match(/Quality Rating: (\d) of \d stars/) ?? []
      return numStars ? `${numStars}.0` : ''
    }
    
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
      //console.log('gustab', index, values)
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
      console.log('before', inputEl, newValue)
      const prototype = Object.getPrototypeOf(inputEl);
      // console.log('after')
      // const valueSetter = Object.getOwnPropertyDescriptor(inputEl, 'value').set;

      console.log('before 2!')
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
      console.log('after 2!')
      // if (valueSetter && valueSetter !== prototypeValueSetter) {
      //     prototypeValueSetter.call(inputEl, newValue);
      // } else {
      //     valueSetter.call(inputEl, newValue);
      // }
      prototypeValueSetter.call(inputEl, newValue);
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.blur()
      console.log('fini')
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
  })
  chrome.storage.session.onChanged.addListener((result) => {
    console.log('of course im serious???', result.test)
    window.demo = result.test?.newValue
    console.log('uh oh', window.demo)
  })



}





