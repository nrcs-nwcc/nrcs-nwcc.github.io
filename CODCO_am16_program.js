 import { tabClick, toFP2, printMapping } from './GOES_string_converter_entry.js'
 
 export function codcoAm16Entry() {
    // add menu entry
    const tabBar = document.getElementById('topNav')
    const am16Button = document.createElement('button')
    am16Button.classList = 'tablinks'
    am16Button.id = 'codco_mapping_am16'
    am16Button.textContent = 'Colorado GOES Mapping AM16'
    am16Button.value = 'CODCO_GOES_mapping_am16'
    am16Button.addEventListener('click', (event) => {
        tabClick(event)
    })
    tabBar.appendChild(am16Button)

    // add body html entry
    const mainSection = document.getElementsByTagName('main')[0]
    const am16Container = document.createElement('div')
    am16Container.id = 'CODCO_GOES_mapping_am16'
    am16Container.style = 'display:none'
    am16Container.innerHTML = am16ProgramHTML
    mainSection.appendChild(am16Container)

    // setup event listeners
    setupEventListeners()
    // generate mapping code
    CODCOgenerateMapping()
 }

function setupEventListeners() {
    // assign input event listeners.
    const inputElements = document.querySelectorAll('#CODCO_GOES_mapping_am16 input')
    Array.from(inputElements).forEach(item => {
        item.addEventListener('change', () => {
            CODCOgenerateMapping()
        })
    })
    // assign input event selection event listeners.
    const selectionElements = document.querySelectorAll('#CODCO_GOES_mapping_am16 select')
    Array.from(selectionElements).forEach(item => {
        item.addEventListener('change', () => {
            CODCOgenerateMapping()
        })
    })
    // assign function buttons
    const buttonElements = document.querySelectorAll('#CODCO_GOES_mapping_am16 button')
    Array.from(buttonElements).forEach(item => {
        if (item.textContent === 'Copy to FP2 Converter Tab') {
            item.addEventListener('click', () => { toFP2('goes_mapping_string_am16') })
        } else if (item.textContent === 'Generate Sensor Management Setup'){
            item.addEventListener('click', () => { genSensorManagementSetup() })
        } else if (item.textContent === 'Clear Sensor Management Section'){
            item.addEventListener('click', () => { clearSensManagSection() })
        }
    })   
}

// generate mapping code
function CODCOgenerateMapping() {
    rhPrams_am16()
    //get form results
    const formRes = document.getElementById("mappingForm").children
    const resDct = {};
    for (let i = 0; i<formRes.length; ++i) {
        if (formRes[i].tagName == "INPUT") {
            var formValue = 0;
            var name = formRes[i].id
            if (formRes[i].checked){
                var formValue = Number(formRes[i].value);
            }
            resDct[name] = formValue;
        } else if (formRes[i].tagName == "SELECT") {
            var name = formRes[i].id
            var formValue = Number(formRes[i].value);
            resDct[name] = formValue;
        }
    }
    //group 1
    let g1Start = 2
    let g1end = g1Start + 4 + resDct["Pillow_am16"] + resDct["Prec_am16"] + resDct["Temp_am16"] + resDct["Snow-depth_am16"] + resDct["Aux_Pillow_am16"] + resDct["Aux_Prec_am16"]
    let g1String = `1,${g1Start}..${g1end}`
    //group 2
    let g2Start = g1end
    let g2end = g2Start + resDct["soils_am16"] * 2
    let g2String
    if (g2end > g2Start) {
        g2end
        g2Start += 1
        g2String = `;2,${g2Start}..${g2end}`
    } else {
        g2String = ''
    }
    //group 3
    let g3Start = g2end
    let g3end = g3Start + resDct["wind_am16"] + resDct["solar_am16"] + resDct["RH_am16"] +  resDct["RH_Temp_am16"]
    let g3String
    if (g3end > g3Start) {
        g3end
        g3Start += 1
        g3String = `;3,${g3Start}..${g3end}`
    } else {
        g3String = ''
    }

    //group 4
    let g4Start = g3end
    let g4end = g4Start + resDct["beadedStream_am16"]
    let g4String
    if (g4end > g4Start) {
        g4end
        g4Start += 1
        g4String = `;4,${g4Start}..${g4end}`
    } else {
        g4String = ''
    }
    //group 5
    let g5Start = g4end
    let g5end = g5Start + resDct["Aux-temp_am16"] + resDct["SuperSite_Temp_am16"] + resDct["Aux-snow-depth_am16"] + resDct["Tert-snow-depth_am16"]
    let g5String
    if (g5end > g5Start) {
        g5end
        g5Start += 1
        g5String = `;5,${g5Start}..${g5end}`
    } else {
        g5String = ''
    }



    //group 16
    let g16Start = g5end
    let g16end = g16Start + resDct["Standard_Parameters_am16"]
    let g16String
    if (g16end > g16Start) {
        g16end
        g16Start += 1
        g16String = `;16,${g16Start}..${g16end}`
    } else {
        g16String = ''
    }  
    //compile. Concatenate all group strings to produce final string 
    const finalString = g1String + g2String + g3String + g4String + g5String + g16String
    printMapping(finalString, "goes_mapping_string_am16")
}

function tableGroupHeaderSetup(groupNumber) {
    const title = document.createElement('h3')
    title.id = `group-${groupNumber}-title`
    title.textContent = `Group ${groupNumber}`
    document.getElementById("sensor-management-container").appendChild(title)
    const tableElemenet = document.createElement('table')
    tableElemenet.id = `sensor-management-${groupNumber}`
    tableElemenet.classList.add('sensor-management-table')
    const labelsRow = document.createElement('tr')
    const labelsFromSetupVar = Object.keys(sensorManagementSetup[0])
    for (let i in labelsFromSetupVar) {
        if ((labelsFromSetupVar[i] !== 'Alt Instruments') && (labelsFromSetupVar[i] !== 'Tert Instruments')) {
            const headerItem = document.createElement('th')
            headerItem.innerText = labelsFromSetupVar[i]
            tableElemenet.appendChild(headerItem)
            if (labelsFromSetupVar[i] === 'Sensor') {
                const headerGroup = document.createElement('th')
                headerGroup.innerText = 'Group'
                const channelGroup = document.createElement('th')
                channelGroup.innerText = 'Channel'
                tableElemenet.appendChild(headerGroup)
                tableElemenet.appendChild(channelGroup)
            }
        }
    }

    document.getElementById("sensor-management-container").appendChild(tableElemenet)
    return tableElemenet
}

function genSensorManagementSetup() {
    document.getElementById("sensor-management-container").innerHTML = ''
    const sensorManagmentContainerTitle = document.createElement('h1')
    sensorManagmentContainerTitle.textContent = 'Sensor Management Setup:'
    document.getElementById("sensor-management-container").appendChild(sensorManagmentContainerTitle)

    var formRes = document.getElementById("mappingForm").children
    ///Sensor management setup
    let channelNumber = 1
    let groupNumber = 1
    let table
    for (let i in formRes) {
        if ((formRes[i].tagName === "INPUT") || (formRes[i].tagName == "SELECT")){
            const id = formRes[i].id
            const oldGroupNumber = groupNumber
            if (id === 'soils_am16'){
                channelNumber = 1
                groupNumber = 2
            } else if (id === 'wind_am16'){
                channelNumber = 1
                groupNumber = 3
            } else if (id === 'beadedStream_am16') {
                channelNumber = 1
                groupNumber = 4
            } else if (id === 'Aux-temp_am16') {
                channelNumber = 1
                groupNumber = 5
            } else if (id === 'Standard_Parameters_am16') {
                channelNumber = 1
                groupNumber = 16
            }
            // setup new table and evaluate if we need to keep old table
            if (channelNumber === 1) {
                if (table) {
                    if (table.childElementCount <= 19) {
                        document.getElementById(`group-${oldGroupNumber}-title`).remove()
                        table.remove()   
                    }
                }
                table = tableGroupHeaderSetup(groupNumber)
                if (groupNumber === 16){ //exit for once group 16 is created
                    break
                }
            }
            // group one battery parameters only //
            if ((groupNumber === 1) && (channelNumber === 1)){
                const filteredRes = sensorManagementSetup.filter(i=>i.Sensor === 'Telemetry Battery BATT.I')[0]
                const telemBatt = generateTableRow(filteredRes, 1, 1)
                channelNumber += 1
                table.appendChild(telemBatt)
            }

            //add sensor channels

            const channelsNeeded = singleInstrumentTypeOptionsWithElement[id]
            let solarParametersAdded
            if (id === 'soils_am16'){
                channelNumber += soilsElementGenerator(table, formRes[i])
            } else if (id === 'solar_am16') {
                channelNumber += solarRadGenerator(table, formRes[i], channelNumber)
            } else if ((id === 'RH_am16') || (id === 'RH_Temp_am16')){
                channelNumber += rhElementGenerator(table, formRes[i], channelNumber, id )
            } else if (id === 'beadedStream_am16'){
                channelNumber += beadedStream(table, formRes[i])
            } else if (id === 'Aux_Prec_am16') {
                channelNumber += auxPrecAndDefaultBattParams(table, formRes[i], channelsNeeded, channelNumber)
            }else {
                // check if we can break from for early
                if (formRes[i].tagName === "INPUT") {
                    if (!formRes[i].checked) {
                        continue
                    }
                } else if (formRes[i].tagName == "SELECT") {
                    if (Number(formRes[i].value) === 0) {
                        continue
                    }
                }

                for (let k in channelsNeeded){

                    let alternativeSensor = 0
                    const filteredRes = sensorManagementSetup.filter(i=>i.Sensor === channelsNeeded[k])[0]
                    if (formRes[i].tagName == "SELECT") {
                        const sensorSelected = formRes[i].options[formRes[i].selectedIndex].textContent

                        const sensorManagemnetInstrument = specificInstrumentTypeOptions[sensorSelected]
                        filteredRes['Alt Instruments'] === sensorManagemnetInstrument ? alternativeSensor = 1 : alternativeSensor
                        filteredRes['Tert Instruments'] === sensorManagemnetInstrument ? alternativeSensor = 2 : alternativeSensor
                    }
                    const res = generateTableRow(filteredRes, groupNumber, channelNumber, null, alternativeSensor)
                    table.appendChild(res)
                    channelNumber += 1
                }
            }
            // add batts before possible breaking from for

        }
    }
    diagnosticParameters()
    document.getElementById("sensor-management-container").scrollIntoView()
}

function auxPrecAndDefaultBattParams(table, auxPrecData, channelsNeeded, channelNumber) {
    if (auxPrecData.checked) {
        const filteredRes = sensorManagementSetup.filter(i=>i.Sensor === channelsNeeded[0])[0]
        const auxPrecRes = generateTableRow(filteredRes, 1, channelNumber, null, 0)
        table.appendChild(auxPrecRes)
        channelNumber += 1
    }
    const allBatts = ['Telemetry Battery BATX.D', 'Logger Battery BATT.I', 'Logger Battery BATX.D', 'Logger Ibat BATT.I']
    for (let k in allBatts){
        const filteredRes = sensorManagementSetup.filter(item=>item.Sensor === allBatts[k])[0]
        const res = generateTableRow(filteredRes, 1, channelNumber)
        table.appendChild(res)
        channelNumber += 1
    } 
    return channelNumber
}

function soilsElementGenerator(table, soilsData) {
    const number = soilsData.options[soilsData.selectedIndex].value
    const channelsNeeded = singleInstrumentTypeOptionsWithElement['soils_am16']
    for (let i = 1; i < Number(number) + 1; i++) {
            let filteredSetup = sensorManagementSetup.filter(item=>item.Sensor === channelsNeeded[0])[0]
            const smsRes = generateTableRow(filteredSetup, 2, i*2 - 1, null, 0)
            table.appendChild(smsRes)
            filteredSetup = sensorManagementSetup.filter(item=>item.Sensor === channelsNeeded[1])[0]
            const tempRes = generateTableRow(filteredSetup, 2, i*2, null, 0)
            table.appendChild(tempRes)
    }
    return Number(number) * 2
}

function solarRadGenerator(table, solarData, channel ) {
    const solarFields = singleInstrumentTypeOptionsWithElement['solar_am16']
    const number = solarData.options[solarData.selectedIndex].value
    for (let i = 0; i < number; i++) {
        let filteredSetup = sensorManagementSetup.filter(item=>item.Sensor === solarFields[i])[0]
        const solarRes = generateTableRow(filteredSetup, 3, channel + i, null, solarData.selectedIndex - 1)
        table.appendChild(solarRes)
    }
    return Number(number)
}

function rhElementGenerator(table, rhData, channel, id ) {
    if (id === "RH_Temp_am16"){
        const relHumData = document.getElementById("mappingForm").children[30]
        const number = relHumData.options[relHumData.selectedIndex].value
        if (number > 0) {
            if (rhData.checked){
                const rhFields = singleInstrumentTypeOptionsWithElement['RH_Temp_am16']
                const rhDataMoisture = document.getElementById("mappingForm").children[30]
                for (let i in rhFields) {
                    
                    let filteredSetup = sensorManagementSetup.filter(item=>item.Sensor === rhFields[i])[0]
                    const rhRes = generateTableRow(filteredSetup, 3, channel + Number(i), null, rhDataMoisture.selectedIndex - 1)
                    table.appendChild(rhRes)
                }
                channel += 1
            }
            const rhFields = singleInstrumentTypeOptionsWithElement['RH_am16']
            for (let i in rhFields) {
                let filteredSetup = sensorManagementSetup.filter(item=>item.Sensor === rhFields[i])[0]
                const rhRes = generateTableRow(filteredSetup, 3, channel + Number(i), null, rhData.selectedIndex - 1)
                table.appendChild(rhRes)
            }
            channel += 4                
        }
        return Number(channel)
    } else {
        return 0
    }  
}

function beadedStream(table, bdsData) {
    if (!bdsData.checked) {
        return 0
    }
    const bdFields = singleInstrumentTypeOptionsWithElement['beadedStream_am16']
    const sensorHeight = [-8, 0, 8,16,24,31,39,47,55,63,71,79,87,94,102,110,118,126]
    for (let i = 1; i <= 18; i++) {
        let filteredSetup = sensorManagementSetup.filter(item=>item.Sensor === bdFields[0])[0]
        const bsRes = generateTableRow(filteredSetup, 4, Number(i), sensorHeight[i-1], 0)
        table.appendChild(bsRes)
    }
    return Number(18)
}

function superSiteHourlyTempGenerator(table, rhData, channel, id ) {
console.log('this fired')
}

function diagnosticParameters() {
    const diagPrams = document.getElementById("mappingForm").children[54]
    const number = Number(diagPrams.options[diagPrams.selectedIndex].value)
    const table = document.getElementById("sensor-management-16")
    if (number === 0) {
        table.remove()
        document.getElementById("group-16-title").remove()
    } else if (number === 5) {
        const channelSetup = singleInstrumentTypeOptionsWithElement['Standard_Parameters_am16_GOES']
        for (let i in channelSetup) {
            const filteredSetup = sensorManagementSetup.filter(item=>item.Sensor === channelSetup[i])[0]
            const diagRes = generateTableRow(filteredSetup, 16, Number(i) + 1, null, 0)
            table.appendChild(diagRes)
        }
    } else if (number === 3) {
        const channelSetup = singleInstrumentTypeOptionsWithElement['Standard_Parameters_am16_cell']
        for (let i in channelSetup) {
            const filteredSetup = sensorManagementSetup.filter(item=>item.Sensor === channelSetup[i])[0]
            const diagRes = generateTableRow(filteredSetup, 16, Number(i) + 1, null, 0)
            table.appendChild(diagRes)
        }
    }


}


function rhPrams_am16(){
    const rhOptions = document.getElementById("RH_am16")
    if ((rhOptions.options[ rhOptions.selectedIndex ].text !== '') && (document.getElementById("RH_Temp_label_am16").style.display === 'none')) {
        document.getElementById("RH_Temp_am16").checked = true
        document.getElementById("RH_Temp_am16").style.display = "inline"
        document.getElementById("RH_Temp_label_am16").style.display = "inline"
    } else if (rhOptions.options[ rhOptions.selectedIndex ].text === '') {
        document.getElementById("RH_Temp_am16").style.display = "none"
        document.getElementById("RH_Temp_label_am16").style.display = "none"
        document.getElementById("RH_Temp_am16").checked = false
    }
}

function clearSensManagSection(){
    document.getElementById("sensor-management-container").innerHTML = ''
}

function generateTableRow(data, group, channel, depthHeight = null, alt = 0) {
    const row = document.createElement('tr')
    const groupItem = document.createElement('td')
    groupItem.textContent = group
    const channelItem = document.createElement('td')
    channelItem.textContent = channel

    for (let i in data) {
        if (alt === 1){
            if ((i !== 'Instrument') && (i !== 'Tert Instruments')){
                if (depthHeight && i === 'Depth-Height') {
                    const itemInRow = document.createElement('td')
                    itemInRow.textContent = depthHeight
                    row.appendChild(itemInRow)
                } else {
                    const itemInRow = document.createElement('td')
                    itemInRow.textContent = data[i]
                    row.appendChild(itemInRow)
                }  
            }
        } else if (alt === 2) {
            if ((i !== 'Instrument') && (i !== 'Alt Instruments')){
                if (depthHeight !== null && i === 'Depth-Height') {
                    const itemInRow = document.createElement('td')
                    itemInRow.textContent = depthHeight
                    row.appendChild(itemInRow)
                } else {
                    const itemInRow = document.createElement('td')
                    itemInRow.textContent = data[i]
                    row.appendChild(itemInRow)
                }  
            } 
        } else {
            if ((i !== 'Alt Instruments') &&  (i !== 'Tert Instruments')){
                if (depthHeight !== null && i === 'Depth-Height') {
                    const itemInRow = document.createElement('td')
                    itemInRow.textContent = depthHeight
                    row.appendChild(itemInRow)
                } else {
                    const itemInRow = document.createElement('td')
                    itemInRow.textContent = data[i]
                    row.appendChild(itemInRow)
                }   
            }
        }
        if (i === "Sensor") {
            row.appendChild(groupItem)
            row.appendChild(channelItem)
        }
    }
    return row
}

const am16ProgramHTML = `
    <!-- CODCO am16 GOES Mapping HTML elements-->
        <h1>CODCO GOES Mapping Generator for 2024 AM16 Program</h1>
        <form id="mappingForm">
            <h3>Group 1 Primary Sensors</h3>
            <label for="Pillow_am16"> Pillow</label>
            <input type="checkbox" checked id="Pillow_am16" value="1"><br>
            <label for="Prec_am16"> Precipitation</label>
            <input type="checkbox" checked id="Prec_am16" value="1"><br>
            <label for="Temp_am16"> Temperature</label>
            <!-- <input type="checkbox" checked id="Temp_am16" value="4"><br> -->
            <select name="Temp-depth" id="Temp_am16">
                <option value="0"></option>
                <option value="4" selected>ST300</option>
                <option value="4">YSI</option>
            </select><br>
            <label for="Snow-depth_am16">Snow Depth</label>
            <select name="snow-depth" id="Snow-depth_am16" >
                <option value="0"></option>
                <option value="1" selected>Judd</option>
                <option value="1">USH9</option>
                <option value="1">SnowVue</option>
            </select><br>
            <label for="Aux_Pillow_am16"> Auxiliary Pillow TXD</label>
            <input type="checkbox" id="Aux_Pillow_am16" value="1" ><br>
            <label for="Aux_Prec_am16"> Auxiliary Precipitation TXD</label>
            <input type="checkbox" id="Aux_Prec_am16" value="1" ><br>

            <h3>Group 2 Soils</h3>
            <label for="soils_am16"> Number of Probes</label>
            <select name="soils" id="soils_am16" >
                <option value="0" selected></option>
                <option value="1">One soil sensor</option>
                <option value="2">Two soil sensors</option>
                <option value="3">Three soil sensors</option>
                <option value="4">Four soil sensors</option>
                <option value="5">Five soil sensors</option>
            </select>
            <h3>Group 3 Extended Sensors</h3>
            <label for="wind_am16"> Wind</label>
            <input type="checkbox" id="wind_am16" value="3" ><br>
            <!-- <label for="solar_am16"> Solar</label>
            <input type="checkbox" id="solar_am16" value="4" ><br> -->
            <label for="solar_am16"> Solar</label>
            <select name="solar" id="solar_am16" >
                <option value="0" selected></option>
                <option value="2">510/610</option>
                <option value="4">SN500</option>
            </select><br>
            <!-- <label for="RH_am16"> RH and RH Temperature</label>
            <input type="checkbox" id="RH_am16" value="5" ><br> -->
            <label for="RH_am16"> RH</label>
            <select name="solar" id="RH_am16" >
                <option value="0" selected></option>
                <option value="4">Hygroclip2</option>
                <option value="4">HMP155</option>
            </select><br>
            <!-- <input type="checkbox" id="RH_am16" value="4" ><br> -->
            <label for="RH_Temp_am16" id="RH_Temp_label_am16" style="display:none"> RH Temp</label>
            <input type="checkbox" id="RH_Temp_am16" value="1" style="display:none" ><br>

            <h3>Group 4 BeadedStream Temperature Cable</h3>
            <label for="beadedStream_am16"> Beadedstream Profile Temperature</label>
            <input type="checkbox" id="beadedStream_am16" value="18" ><br>

            <h3>Group 5 Auxiliary Sensors</h3>
            <label for="Aux-temp_am16"> Auxiliary Temperature</label>
            <input type="checkbox" id="Aux-temp_am16" value="4" ><br>
            <label for="SuperSite_Temp_am16"> Super Site Hourly Temp (only for Super Sites)</label>
            <input type="checkbox" id="SuperSite_Temp_am16" value="6" ><br>
            <label for="Aux-snow-depth_am16">Auxiliary Snow Depth</label>
            <select name="Aux-snow-depth" id="Aux-snow-depth_am16" >
                <option value="0" selected></option>
                <option value="1">USH9</option>
                <option value="1">SnowVue</option>
            </select><br>
            <label for="Tert-snow-depth_am16"> Tertiary Snow Depth</label>
            <select name="Tert-snow-depth" id="Tert-snow-depth_am16" >
                <option value="0" selected></option>
                <option value="1">USH9</option>
                <option value="1">SnowVue</option>
            </select><br>
            <h3>Group 16 Diagnostic Parameter Options</h3>
            <label for="Standard_Parameters_am16"> Standard Diagnoistic Parameters</label>
            <select name="standard_parameters" id="Standard_Parameters_am16" >
                <option value="0" ></option>
                <option value="5" selected>GOES</option>
                <option value="3">Cell</option>
            </select><br>
            <!-- <input type="checkbox" id="Standard_Parameters_am16" checked value="5" ><br> -->
        </form>
        <h1>GOES Mapping Code:</h1>
        <h3 id="goes_mapping_string_am16"></h3>
        <button>Copy to FP2 Converter Tab</button>
        <button>Generate Sensor Management Setup</button>
        <button>Clear Sensor Management Section</button>
        <div id="sensor-management-container"></div>
`





























const singleInstrumentTypeOptionsWithElement = {
    Pillow_am16: ['Pillow Txd WTEQ.I'],
    Prec_am16: ['Precipitation Txd PREC.I'],
    Temp_am16: ['Air temp TOBS.I', 'Air temp TMAX.D', 'Air temp TMIN.D', 'Air temp TAVG.D'],
    'Snow-depth_am16': ['Snow depth SNWD.I'],
    Aux_Pillow_am16: ['Aux Pillow Txd WTEQ.I'],
    Aux_Prec_am16: ['Aux Precipitation Txd PREC.I'],
    soils_am16: ['Soil Moisture SMS.I','Soil Temperature STO.I'],
    wind_am16: ['wind WSPDV.H-1', 'wind WDIRV.H-1', 'wind WSPDX.H-1'],
    'solar_am16': ['Solar Rad incoming SW SWINV.H', 'Solar Rad reflected SW SWOTV.H', 'Solar Rad incoming LW LWINV.H', 'Solar Rad reflected LW LWOTV.H'],
    RH_am16: ['RH instantainous RHUM.I','RH max RHUMX.H', 'RH min RHUMN.H', 'RH avg RHUMV.H'],
    RH_Temp_am16: ['RH Temp TOBS.I-2'],
    beadedStream_am16 : ['Profile temperature PTEMP.I'],
    'Aux-temp_am16': ['Aux YSI air temp TOBS.I', 'Aux YSI air temp TMAX.D', 'Aux YSI air temp TMIN.D', 'Aux YSI air temp TAVG.D'],
    'SuperSite_Temp_am16':['Air temp TMAX.H', 'Air temp TMIN.H', 'Air temp TAVG.H', 'RH Temp TMAX.H', 'RH Temp TMIN.H', 'RH Temp TAVG.H'],
    'Aux-snow-depth_am16': ['Aux Snow Depth SNWD.I'],
    'Tert-snow-depth_am16': ['Tert Snow Depth SNWD.I'],
    Standard_Parameters_am16_cell: ['Diag - Skipped Scans', 'Diag - Logger Watchdog Errors', 'Diag - Logger Temperature'],
    Standard_Parameters_am16_GOES: ['Diag - Skipped Scans', 'Diag - Logger Watchdog Errors', 'Diag - Logger Temperature', 'Diag - Last Hour Forward Power', 'Diag - Last Hour Reverse Power']
}
const specificInstrumentTypeOptions = {
    '510/610': ['Radiometer - Apogee 510 - SW', 'Radiometer - Apogee 610 - SW'],
    'SN500': 'Radiometer - Apogee SN500',
    'Judd': 'Judd Ultrasonic GCCP',
    'USH9': 'Snow Depth - Sommer USH9',
    'SnowVue': 'Snow Depth - Campbell SnowVue',
    'YSI': 'YSI extended range',
    'ST300': 'Air Temp - ST-300',
    'Hygroclip2': 'Hygroclip',
    'HMP155': 'Air Temp/RH Vaisala HMP155'

}

const sensorManagementSetup = [
    {
    "Sensor": "Telemetry Battery BATT.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Telemetry Battery",
    "Environmental Observation": "",
    "Element": "battery",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "volt",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Battery System",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 hour"
    },
    {
    "Sensor": "Pillow Txd WTEQ.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "zero sensor",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "snow water equivalent",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "inch",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "100\" transducer - Druck",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 Hour"
    },
    {
    "Sensor": "Precipitation Txd PREC.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "PR offset",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "precipitation accumulation",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "inch",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "100\" transducer - Druck",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 Hour"
    },
    {
    "Sensor": "Air temp TOBS.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - ST-300",
    "Alt Instruments": "YSI extended range",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Air temp TMAX.D",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "maximum for interval",
    "Duration": "1 day",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - ST-300",
    "Alt Instruments": "YSI extended range",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Air temp TMIN.D",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "minimum for interval",
    "Duration": "1 day",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - ST-300",
    "Alt Instruments": "YSI extended range",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Air temp TAVG.D",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "average for interval",
    "Duration": "1 day",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - ST-300",
    "Alt Instruments": "YSI extended range",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Snow depth SNWD.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "zero sensor",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "snow depth",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "inch",
    "Multiplier": -1,
    "Constant": 0,
    "Instrument": "Judd Ultrasonic GCCP",
    "Alt Instruments": "Snow Depth - Sommer USH9",
    "Tert Instruments": "Snow Depth - Campbell SnowVue",
    "Stack Number": null,
    "Sampling Frequency": "1 hour"
    },
    {
    "Sensor": "Aux Pillow Txd WTEQ.I",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "zero sensor",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "snow water equivalent",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "inch",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "100\" transducer - Druck",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 Hour"
    },
    {
    "Sensor": "Aux Precipitation Txd PREC.I",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "PR offset",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "precipitation accumulation",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "inch",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "100\" transducer - Druck",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 Hour"
    },
    {
    "Sensor": "Telemetry Battery BATX.D",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Telemetry Battery",
    "Environmental Observation": "",
    "Element": "battery",
    "Function": "maximum for interval",
    "Duration": "1 day",
    "Data Units": "volt",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Battery System",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Logger Battery BATT.I",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Logger Battery",
    "Environmental Observation": "",
    "Element": "battery",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "volt",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Battery System",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 Hour"
    },
    {
    "Sensor": "Logger Battery BATX.D",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Logger Battery",
    "Environmental Observation": "",
    "Element": "battery",
    "Function": "maximum for interval",
    "Duration": "1 day",
    "Data Units": "volt",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Battery System",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Logger Ibat BATT.I",
    "Label": "clear label",
    "Ordinal": 3,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Logger IBAT",
    "Environmental Observation": "",
    "Element": "battery",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "volt",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Battery System",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 Hour"
    },
    {
    "Sensor": "Soil Moisture SMS.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "use dropdown to add sensor depth",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Silt Equation",
    "Environmental Observation": "silt",
    "Element": "soil moisture percent",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "percent ",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Soil Moist/Temp -Stevens Hydraprobe (value output)",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": 1,
    "Sampling Frequency": "1 Hour"
    },
    {
    "Sensor": "Soil Temperature STO.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "use dropdown to add sensor depth",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "soil temperature",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Soil Moist/Temp -Stevens Hydraprobe (value output)",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": 1,
    "Sampling Frequency": "1 Hour"
    },
    {
    "Sensor": "wind WSPDV.H-1",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "wind speed",
    "Function": "average for interval",
    "Duration": "1 hour",
    "Data Units": "mile/hour",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Wind Vane - RM Young 5108",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "5 Sec"
    },
    {
    "Sensor": "wind WDIRV.H-1",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "wind direction",
    "Function": "average for interval",
    "Duration": "1 hour",
    "Data Units": "degree",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Wind Vane - RM Young 5108",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "5 Sec"
    },
    {
    "Sensor": "wind WSPDX.H-1",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "wind speed",
    "Function": "maximum for interval",
    "Duration": "1 hour",
    "Data Units": "mile/hour",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Wind Vane - RM Young 5108",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "5 Sec"
    },
    {
    "Sensor": "Solar Rad incoming SW SWINV.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "radiation incoming shortwave",
    "Function": "average for interval",
    "Duration": "1 hour",
    "Data Units": "watt/meter squared",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Radiometer - Apogee 510 - SW",
    "Alt Instruments": "Radiometer -Apogee SN500",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "5 Sec"
    },
    {
    "Sensor": "Solar Rad reflected SW SWOTV.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "radiation outgoing shortwave",
    "Function": "average for interval",
    "Duration": "1 hour",
    "Data Units": "watt/meter squared",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Radiometer - Apogee 610 - SW",
    "Alt Instruments": "Radiometer -Apogee SN500",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "5 Sec"
    },
    {
    "Sensor": "Solar Rad incoming LW LWINV.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "radiation incoming longwave",
    "Function": "average for interval",
    "Duration": "1 hour",
    "Data Units": "watt/meter squared",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "",
    "Alt Instruments": "Radiometer -Apogee SN500",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "5 Sec"
    },
    {
    "Sensor": "Solar Rad reflected LW LWOTV.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "radiation outgoing longwave",
    "Function": "average for interval",
    "Duration": "1 hour",
    "Data Units": "watt/meter squared",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "",
    "Alt Instruments": "Radiometer -Apogee SN500",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "5 Sec"
    },
    {
    "Sensor": "RH Temp TOBS.I-2",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "RH air temp",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "degree celcius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Hygroclip",
    "Alt Instruments": "Air Temp/RH Vaisala HMP155",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "RH instantainous RHUM.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "relative humidity",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "percent ",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Hygroclip",
    "Alt Instruments": "Air Temp/RH Vaisala HMP155",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "RH max RHUMX.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "relative humidity",
    "Function": "maximum for interval",
    "Duration": "1 hour",
    "Data Units": "percent ",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Hygroclip",
    "Alt Instruments": "Air Temp/RH Vaisala HMP155",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "RH min RHUMN.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "relative humidity",
    "Function": "minimum for interval",
    "Duration": "1 hour",
    "Data Units": "percent ",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Hygroclip",
    "Alt Instruments": "Air Temp/RH Vaisala HMP155",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "RH avg RHUMV.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "relative humidity",
    "Function": "average for interval",
    "Duration": "1 hour",
    "Data Units": "percent ",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Hygroclip",
    "Alt Instruments": "Air Temp/RH Vaisala HMP155",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Profile temperature PTEMP.I",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "use dropdown to add sensor height/depth",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "profile temperature",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Snow Temp - Beaded Stream DTC",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 hour"
    },
    {
    "Sensor": "Aux YSI air temp TOBS.I",
    "Label": "clear label",
    "Ordinal": 3,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "YSI Extended range - old sensor co-located with ST300",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - YSI 44211A Corrected",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Aux YSI air temp TMAX.D",
    "Label": "clear label",
    "Ordinal": 3,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "YSI Extended range - old sensor co-located with ST300",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "maximum for interval",
    "Duration": "1 day",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - YSI 44211A Corrected",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Aux YSI air temp TMIN.D",
    "Label": "clear label",
    "Ordinal": 3,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "YSI Extended range - old sensor co-located with ST300",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "minimum for interval",
    "Duration": "1 day",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - YSI 44211A Corrected",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Aux YSI air temp TAVG.D",
    "Label": "clear label",
    "Ordinal": 3,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "YSI Extended range - old sensor co-located with ST300",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "average for interval",
    "Duration": "1 day",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - YSI 44211A Corrected",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Air temp TMAX.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "maximum for interval",
    "Duration": "1 Hour",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - ST-300",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Air temp TMIN.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "minimum for interval",
    "Duration": "1 Hour",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - ST-300",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Air temp TAVG.H",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "average for interval",
    "Duration": "1 Hour",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp - ST-300",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "RH Temp TMAX.H",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "maximum for interval",
    "Duration": "1 Hour",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp/RH Vaisala HMP155",
    "Alt Instruments": "",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "RH Temp TMIN.H",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "minimum for interval",
    "Duration": "1 Hour",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp/RH Vaisala HMP155",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "RH Temp TAVG.H",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "air temperature",
    "Function": "average for interval",
    "Duration": "1 Hour",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "Air Temp/RH Vaisala HMP155",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 minutes"
    },
    {
    "Sensor": "Aux Snow Depth SNWD.I",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "zero sensor",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "snow depth",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "inch",
    "Multiplier": -1,
    "Constant": 0,
    "Instrument": "Snow Depth - Sommer USH9",
    "Alt Instruments": "Snow Depth - Campbell SnowVue",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 hour"
    },
    {
    "Sensor": "Tert Snow Depth SNWD.I",
    "Label": "clear label",
    "Ordinal": 3,
    "Depth-Height": "",
    "offset": "zero sensor",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "",
    "Environmental Observation": "",
    "Element": "snow depth",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "inch",
    "Multiplier": -1,
    "Constant": 0,
    "Instrument": "Snow Depth - Sommer USH9",
    "Alt Instruments": "Snow Depth - Campbell SnowVue",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": "1 hour"
    },
    {
    "Sensor": "Diag - Skipped Scans",
    "Label": "clear label",
    "Ordinal": 1,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Skipped Scans",
    "Environmental Observation": "",
    "Element": "diagnostics",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "unitless",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "none",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": ""
    },
    {
    "Sensor": "Diag - Logger Watchdog Errors",
    "Label": "clear label",
    "Ordinal": 2,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Logger Watchdog Errors",
    "Environmental Observation": "",
    "Element": "diagnostics",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "unitless",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "none",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": ""
    },
    {
    "Sensor": "Diag - Logger Temperature",
    "Label": "clear label",
    "Ordinal": 3,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Logger Temperature",
    "Environmental Observation": "",
    "Element": "diagnostics",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "degree celsius",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "none",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": ""
    },
    {
    "Sensor": "Diag - Last Hour Forward Power",
    "Label": "clear label",
    "Ordinal": 4,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Last Hour Forward Power",
    "Environmental Observation": "",
    "Element": "diagnostics",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "watt",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "none",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": ""
    },
    {
    "Sensor": "Diag - Last Hour Reverse Power",
    "Label": "clear label",
    "Ordinal": 5,
    "Depth-Height": "",
    "offset": "0",
    "Force Suspect": "if data is good leave unchecked",
    "Remark": "Last Hour Reverse Power",
    "Environmental Observation": "",
    "Element": "diagnostics",
    "Function": "current observation",
    "Duration": "instantaneous",
    "Data Units": "watt",
    "Multiplier": 1,
    "Constant": 0,
    "Instrument": "none",
    "Alt Instruments": "",
    "Tert Instruments": "",
    "Stack Number": null,
    "Sampling Frequency": ""
    }
]