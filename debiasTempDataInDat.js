/strict/

////////// Debiasing functions

function TempDebias(T) {
    // Temp Debias Based on NOAA-9 / CO Snow Survey website equation
    const base = (parseFloat(T) + 65.929) / 194.45
    const aa = 610558.226380138 * Math.pow(base, 9)
    const bb = -2056177.65461394 * Math.pow(base, 8)
    const cc = 2937046.42906361 * Math.pow(base, 7)
    const dd = -2319657.12916417 * Math.pow(base, 6)
    const ee = 1111854.33825836 * Math.pow(base, 5)
    const ff = -337069.883250001 * Math.pow(base, 4)
    const gg = 66105.7015922199 * Math.pow(base, 3)
    const hh = -8386.78320604513 * Math.pow(base, 2)
    const ii = 824.818021779729 * base
    const kk = -86.7321006757439
    return aa + bb + cc + dd + ee + ff + gg + hh + ii + kk // debiased temp value
}

function debiasMenu(data) {
    const rows = data.split('\n')
    const headerRow  = rows[1].split(',')
    const container = document.getElementById('debias-menu')
    container.innerHTML = '' //remove all items from previous upload
    const headerTitle = document.createElement('h3')
    headerTitle.textContent = 'Select YSI Extended Range Temperature Elements to Debias:'
    container.appendChild(headerTitle)
    const selection = document.createElement('form')
    container.appendChild(selection)
    headerRow.forEach((item, loc) => {
        if ((item !== '"TIMESTAMP"') && (item !== '"RECORD"')) {
            const inputlabel = document.createElement('label')
            inputlabel.textContent = item.replace(/[(")]/g, '')
            const inputItem = document.createElement('input')
            inputItem.setAttribute("type", "checkbox")
            inputItem.setAttribute("id", `${item}-select`)
            inputlabel.setAttribute('for', `${item}-select`)
            inputItem.setAttribute("value", loc)
            selection.appendChild(inputItem)
            selection.appendChild(inputlabel)
            selection.appendChild(document.createElement('br'))
        }
    })
}

function debiasProcessing(rows) {
    const filteredHtmlCollection = Array.from(document.querySelectorAll ('#debias-menu form input')).filter(i => i.checked)
    const columnIndices = filteredHtmlCollection.map(i => Number(i.value))
    return rows.map( (row, idx) => {
        const columns = row.split(',')
        if (idx > 3) {
            columnIndices.forEach(index => {
                if (columns[index]) {
                    const temperature = parseFloat(columns[index])
                    let debiasedValue = temperature >= -55 && temperature <= 60 ? TempDebias(temperature) : temperature
                    columns[index] = debiasedValue ? String(debiasedValue.toPrecision(4)) : '"NAN"' // SNOTEL Storage expects a "NAN" with quotes.
                    // returned as float because that seemed to work best..
                }
            })
        }
        return columns.join(',')
    })  
}

///////////////// timestamp functions

function dataTimeIndexAdjustmentMenu(data) {
    // get array of date strings
    const rows = data.rawFile.split('\n')
    const dataRows = rows.filter((item,idx) => (idx > 3) && (item !== ""))
    const timeIndex = dataRows.map(item => item.split(',')[0].replace(/[(")]/g, ''))
    // select start date
    const selectStart = document.getElementById('start-time-to-edit')
    selectStart.innerHTML = ''
    timeIndex.forEach((item,idx) => {
        option = document.createElement('option')
        option.value = idx
        option.textContent = item
        selectStart.appendChild(option)
    })
    // select end date
    const selectEnd = document.getElementById('end-time-to-edit')
    selectEnd.innerHTML = ''
    timeIndex.forEach((item,idx) => {
        option = document.createElement('option')
        option.value = idx
        option.textContent = item
        if (timeIndex.length - 1 === idx) {
            option.selected = true
        }
        selectEnd.appendChild(option)
    })
    document.getElementById('hour-diff').addEventListener('change', () => {
        if (document.getElementById('hour-diff').value !== '') {
            document.getElementById('new-start-date').disabled = true
        }  else {
            document.getElementById('new-start-date').disabled = false
        }
    })
    document.getElementById('new-start-date').addEventListener('change', () => {
        if (document.getElementById('new-start-date').value !== '') {
            document.getElementById('hour-diff').disabled = true
        }  else {
            document.getElementById('hour-diff').disabled = false
        }
    })
    const form = document.getElementById('datetime-form')
    if (!form.getAttribute('submit-event-attached')) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevents the default form submission
            const form = document.getElementById('datetime-form')
            const dateTimeFormRes = {}
            Array.from(form.children).forEach( (item) =>{
                if (item.tagName === 'INPUT') {
                    dateTimeFormRes[item.id] = item.value
                } else if (item.tagName === 'SELECT') {
                    dateTimeFormRes[item.id] = item.value
                }
            })
            data.timeIndexSettings = dateTimeFormRes
            printDatFile(data,true)
        })
        form.setAttribute('submit-event-attached', true)
    }
    document.getElementById('datetime-menu').style['display'] = 'block'
}

function dataTimeProcessing(rows, data) {
    const datetimeIdxSet = data.timeIndexSettings
    console.log()
    if (datetimeIdxSet) {
        if ((datetimeIdxSet['hour-diff'] === '') && (datetimeIdxSet['new-start-date'] === '')) {
            window.alert('Must enter hours (+/-) to offset selected range of the datetime index or define a new start date for the selected datetime index range. \nResetting datetime index')
            return rows
        } else {
            // get index
            const headers = rows.slice(0,4)
            const dataRows = rows.slice(4)//rows.filter((item,idx) => (idx > 3) && (item !== ""))
            const timeIndexString = dataRows.map(item => item.split(',')[0].replace(/[(")]/g, ''))
            const filteredIdxString = timeIndexString.filter(( _, index) => ((Number(datetimeIdxSet['start-time-to-edit']) <= index ) && (Number(datetimeIdxSet['end-time-to-edit']) >= index)))
            const timeIndexArray = filteredIdxString.map(item => stringToTimeArray(item))
            let hourDiff = 0
            if (datetimeIdxSet['hour-diff'] !== '') {
                hourDiff = Number(datetimeIdxSet['hour-diff'])
            } else if (datetimeIdxSet['new-start-date'] !== '') {
                if (!dateTimeFormatCheck(data)) { return rows}
                const startTimeToEdit = timeIndexString[Number(datetimeIdxSet['start-time-to-edit'])]
                hourDiff = getDifferenceFromNewStartDateAndOld(startTimeToEdit ,datetimeIdxSet['new-start-date'])
            }
            const newIndex = timeIndexArray.map( item => dateTimeOffsetFunc(item, hourDiff))
            const combineWithOld = timeIndexString.map((timeStamp,index) => {
                if ((Number(datetimeIdxSet['start-time-to-edit']) <= index ) && (Number(datetimeIdxSet['end-time-to-edit']) >= index)) {
                    return newIndex[index - Number(datetimeIdxSet['start-time-to-edit'])]
                } else {
                    return timeStamp
                }
            })
            
            rows = headers.concat(dataRows.map((item, index) => {
                const data = item.split(',').slice(1).join(',') 
                if (combineWithOld[index].length > 0) {
                    return `"${combineWithOld[index]}",${data}`
                } else {
                    return ''
                }
                
            }))
        }
    }
    return rows
}

function dateTimeFormatCheck (data) {
    const dateTime = data.timeIndexSettings['new-start-date']
    let results = true
    try {
        let checkFail
        arrayFromString = stringToTimeArray(dateTime) // tries to parse
        switch(true) {
            case (arrayFromString[0] > (new Date()).getUTCFullYear()) || (arrayFromString[0] < 1900):
                checkFail = 'year is greater then current year or less then 1900'
                break
            case (arrayFromString[1] > 11) || (arrayFromString[1] < 0):
                checkFail = 'month is greater then 12 or less then 0'
                break
            case (arrayFromString[2] > 31) || (arrayFromString[2] < 0):
                checkFail = 'month is greater then 31 or less then 0'
                break
            case (arrayFromString[3] > 24) || (arrayFromString[3] < 0):
                checkFail = 'hour is greater then 24 or less then 0'
                break
        }
        if (checkFail) { throw new Error(checkFail)}
    } catch (error) {
        alert(`Datetime formate submitted is improper. Must be formated "YYYY-MM-DD HH:MM:SS". "HH:MM:SS" are optional. The year must not exceed the current year. ${error}`)
        results = false
        data.timeIndexSettings = undefined
    }
    return results
}

function stringToTimeArray(str) {
    const date = str.split(' ')[0]
    const dateArray = date.split('-').map((i,index) => {if (index === 1) {
       return Number(i) - 1 
    } else {
        return Number(i)
    } })
    if (dateArray.length !== 3) { throw new Error('datetime string formated incorrectly.') }
    const time = str.split(' ')[1]
    const timeArray = time ? [time.split(':').map(i => Number(i))[0], 0, 0] : [0,0,0]
    return dateArray.concat(timeArray)   
}

function getDifferenceFromNewStartDateAndOld(oldTimeStr, newTimeStr) {
    const oldTimeArray = stringToTimeArray(oldTimeStr)
    const newTimeArray = stringToTimeArray(newTimeStr)
    const hours = (Date.UTC(...newTimeArray) - Date.UTC(...oldTimeArray)) / (60 * 60 * 1000)
    return hours
}

function dateTimeOffsetFunc (dtArray, offsetInHours) {
    const offSetInMilisec = offsetInHours * 60 * 60 * 1000
    const modDateTimeObject = new Date(Date.UTC(...dtArray) + offSetInMilisec)
    if (String(modDateTimeObject) === 'Invalid Date') {
        return 'NAN'
    }
    const modifiedDtArray = [
        modDateTimeObject.getUTCFullYear(), 
        modDateTimeObject.getUTCMonth() + 1, 
        modDateTimeObject.getUTCDate(),
        modDateTimeObject.getUTCHours(),
        0,
        0 
    ]
    const strArray = modifiedDtArray.map(i => i.toString().padStart(2,0))
    return `${strArray[0]}-${strArray[1]}-${strArray[2]} ${strArray[3]}:${strArray[4]}:${strArray[5]}`
}

///////////////// process nans functions
function nanSectionSetup(data) {
    document.getElementById('nan-section').style['display'] = 'block'
    const nanOption = document.getElementById('remove-nans')
    if (!nanOption.getAttribute('nan-event-listener')) {
        nanOption.addEventListener('change', () => {
            printDatFile(data)
        })
        nanOption.setAttribute('nan-event-listener', true)
    }
}

function nanReplacer(rows){
    if (document.getElementById('remove-nans').checked) {
        rows = rows.map(i => i.replaceAll(",\"NAN\"", ",-8190"))
    }
    return rows
}

///////////////////////////// file functions

function loadDatFile(event, data) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader()
        reader.onload = (evt) => {
            document.getElementById('output').textContent = '' //clear preview when uploading new file
            document.getElementById('saveButton').disabled = true
            data.timeIndexSettings = undefined
            data.rawFileName = file.name.split('.')[0]
            data.rawFile = evt.target.result
            debiasMenu(evt.target.result)
            dataTimeIndexAdjustmentMenu(data)
            nanSectionSetup(data)
            printDatFile(data, false)
            document.querySelector('#debias-menu form').removeEventListener('change', () => { printDatFile(data) })
            document.querySelector('#debias-menu form').addEventListener('change', () => { printDatFile(data) })
        }
        reader.readAsText(file)
    }
}

function printDatFile(data, enable = true) {
    document.getElementById('preview').style.display = "block"
    let rows = data.rawFile.split('\n')
    rows = debiasProcessing(rows) // process temp debiasing
    rows = dataTimeProcessing(rows, data)     // process timestamp ajustments
    rows = nanReplacer(rows)     // replace nans 
    const updatedText = rows.join('\n')  
    data.processedFile = updatedText
    document.getElementById('output').textContent = updatedText
    document.getElementById('saveButton').disabled = !enable
}

function downloadData(data) {
    if (data.processedFile !== '') {
        const blob = new Blob([data.processedFile], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.rawFileName}_processed.dat`; // Specify the name for the downloaded file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert('No change from origional file!')
    }
}

///////////////////////// application entry point.
window.onload = () => {
    const data = {
        rawFileName:'',
        rawFile:'',
        processedFile:''
    }
    document.getElementById('fileInput').addEventListener('change', (event) => { loadDatFile(event, data) })
    document.getElementById('saveButton').addEventListener('click', () => { downloadData(data) })
}


