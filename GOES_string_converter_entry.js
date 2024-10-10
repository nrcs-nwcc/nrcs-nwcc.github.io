"use strict"
import { codcoAm16Entry } from "./CODCO_am16_program.js"
import { codcoJuddEntry } from './CODCO_JUDD_program.js'

// applicaton entry point

window.onload = () => {
    //setup event listeners
    const FP2tab = document.getElementById('FP2')
    FP2tab.addEventListener('click', (event) => {
        tabClick(event)
    })
    const goesString = document.getElementById('goesString')
    goesString.addEventListener('change', () => {
        spaceRemover()
    })
    const buttons = document.querySelectorAll('#FP2_converter button')
    Array.from(buttons).forEach(item => {
        if(item.textContent === 'Submit') {
            item.addEventListener('click', () => {
                resultsFP2()
            })
        } else if  (item.textContent === 'Clear Results') {
            item.addEventListener('click', () => {
                clearResults()
            })
        }
    })
    // add DCO program pluggins
    codcoAm16Entry()
    codcoJuddEntry()
}

//Function triggered by the top menu bar elements upon click. Defines which div section is displayed.
export function tabClick(evt) {
    // set active menu
    const button = evt.target
    const navChildren = document.getElementById("topNav").children
    Array.from(navChildren).forEach(item => {
        if (button.id === item.id) {

            item.className = "tablinks active"
        } else {
            item.className = "tablinks"
        }
    })
    //set avtive section
    const docSections = document.getElementsByTagName('main')[0].children
    Array.from(docSections).forEach(item => {
        if (item.id === button.value) {
            item.style =  "display:block" 
        } else {
            item.style = "display:none"
        }
    })
}

//function added to remove space in GOES string upon changes.
function spaceRemover() {
    var mapText = document.getElementById("goesString").value 
    document.getElementById("goesString").value  = mapText.replace(/\s+/g, '');
}

//copies GOES mapping string to FP2 tab.
export function toFP2(id){
    const mapText = document.getElementById(id).textContent
    document.getElementById('FP2').click()
    const headerVersionElement = document.querySelector('#headerversion option[value="header"]')
    headerVersionElement.setAttribute('selected','selected')
    document.getElementById("gmapping")
    document.getElementById("gmapping").value = mapText
}

//function for bankers rounding
function bankRound(num, decimalPlaces) {
    const d = decimalPlaces || 0;
    const m = Math.pow(10, d);
    const n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
    const i = Math.floor(n), f = n - i;
    const e = 1e-8; // Allow for rounding errors in f
    const r = (f > 0.5 - e && f < 0.5 + e) ?
                ((i % 2 == 0) ? i : i + 1) : Math.round(n);
    return d ? r / m : r;
}
//clears all elements from the div 'results' tag
function clearResults(){
    const res = document.getElementById("results")
    if (res.childElementCount > 0){
        while (res.firstChild) {
            res.removeChild(res.firstChild);
        }
    }
}
//calculate julian day
function julianDay(){
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day
}

//calculate Pacific Standared Time hour
function pstHour() {
    const time = 8; //8 hours behind UTC time is PST
    const currTime = new Date();
    const d = new Date(currTime.getTime() - (time * 3600000));
    const hours = d.getUTCHours();
    return String(hours) + ":00"
}

//function that displays Julian day from start of year and Current hour of Portland Standard Time
function showTime(){
    const txt = document.createElement("p")
    txt.textContent = `Current relative Julian day is ${julianDay()} and current hour is ${pstHour()} in PST (24-hour clock).`
    const results = document.getElementById("results")
    results.appendChild(txt)
}

// function to convert Campbell's FP2 to human readable values
function convertString(){
    let gString = document.getElementById("goesString").value;
    if (gString[0] == "\"") {
        gString = gString.slice(1,gString.length);
    }
    const num_vals = gString.length / 3.0;
    const vals = [] //array for storing all converted values
    if (!Number.isInteger(num_vals)){
        alert("String seems to be missing charactors or has additional spaces or charactors added to it. Please fix and resubmit");
    } else {
        for (let i = 0; i <num_vals; ++i) {
            let DV = 0
            let SF = 1
            
            //charCode converts charactor to unicode then & performs bitwise multiplication on int
            const A = gString.slice(3 * i,3 * i + 3).charCodeAt(0) & 15 
            const B = gString.slice(3 * i,3 * i + 3).charCodeAt(1) & 63
            const C = gString.slice(3 * i,3 * i + 3).charCodeAt(2) & 63
            
            // Decode the results of the bitwise operation (this is the Campbell propriatery part)
            if (((A * 64) + B) >= 1008){
                DV = (B - 48) * 64 + C + 9000
            } else {
                if ((A & 8) > 0){
                    SF = -1
                }                        
                if ((A & 4) > 0){
                    SF = SF * 0.01
                }
                if ((A & 2) > 0) {
                    SF = SF * 0.1
                }
                if ((A & 1) > 0) {
                    DV = 4096
                }    
                DV = (DV + ((B & 63) * 64) + (C & 63)) * SF
            }
            if (!Number.isInteger(DV)){
                DV = bankRound(DV,1) //if number is not an int round to 1 decimal place
            }
            vals.push(DV) // push to array
        }

    };
    return vals
}

// function for data using GOES header information to split array from converted FP2 string into appropriate groups
function publish_header(valArray, selectTimeStep){
    // function takes array from FP2 conversion and a time step "selectTimeStep" to convert data.
    const resDct = {}
    //goes mapping data and arrays
    const goesMapping = document.getElementById("gmapping").value
    const groupVals = goesMapping.split(";")
    //data to use
    const header = valArray.slice(0,2); //goes header data is always first 2 values of array
    const dataChannels = header[1]; //get number of channels logger things its telemetering in header data
    resDct["Goes Header"] = header; 
    const channelsFromMapping = Number(groupVals[groupVals.length-1].split("..")[1]) - 1; //extracts the number of channels expected from GOES Mapping string
    if ( channelsFromMapping !== dataChannels) { //throw error if mismach
        alert(`The number of channels calculated from the GOES mapping is ${channelsFromMapping} and the number of channels telemetered is ${dataChannels}. GOES string must match what is telemetered. Check that the correct mapping is used and that correct header version is selected. If still inconsistant, logger configuration may be wrong.`)
        throw("miss-mach GOES mapping config")
    }

    const dataAndTime = valArray.slice(2,valArray.length+1)
    const goesTime = dataAndTime.slice(0 + (2+dataChannels) * (selectTimeStep -1),0 + (2 + dataChannels) * (selectTimeStep -1) + 2);
    resDct["Goes Time Information"] = goesTime;
    const data = dataAndTime.slice(dataChannels * (selectTimeStep -1) + (2 * selectTimeStep), (dataChannels + 2 ) * selectTimeStep);
    //create data dict for display. Dict contains all groups and arrays of data assigned to those groups
    for (let i in groupVals) {
        const groupArr = groupVals[i].split(",")
        const groupName = groupArr[0]
        const startEndChans = groupArr[1].split("..").map(item => Number(item))
        let index = Array(startEndChans[1] - startEndChans[0] + 1).fill().map((_, idx) => startEndChans[0] + idx)
        index = index.map(item => item -2)
        const dataVals = []  
        for (let j in index){
            dataVals.push(data[index[j]])
        }
        resDct['Group '+ groupName] = dataVals
    }
    //dispay results by looping through dict
    showTime()
    const res = document.getElementById("results")
    for (let tbl in resDct) {
        const displayName = document.createElement("h3");
        displayName.textContent = tbl +":"
        res.appendChild(displayName);
        const table = document.createElement("table")
        table.className = "alltables"

        const tr1 = document.createElement("tr")
        const header1 = document.createElement("th");
        header1.textContent = "AWDB Channel in Group:"
        tr1.appendChild(header1)
        const tr2 = document.createElement("tr")
        const header2 = document.createElement("th");
        header2.textContent = "Sensor Output:"
        tr2.appendChild(header2);

        const grpVals = resDct[tbl];
        for (let i in grpVals){
            
            const item1 = document.createElement("td");
            if (tbl === "Goes Time Information") {
                if (Number(i) === 0 ){
                    item1.textContent = "Julian Day"
                } else {
                    item1.textContent = "Hour"
                }
            } else if (tbl === "Goes Header") {
                if (Number(i) === 0 ){
                    item1.textContent = "# of Time Steps Telemetered"
                } else {
                    item1.textContent = "Number of Channels"
                }
            } else {
                item1.textContent = Number(i) + 1; 
            }
            item1.style = "width: 100px";
            const item2 = document.createElement("td");
            item2.textContent = grpVals[i];
            item2.style = "width: 100px";
            tr1.appendChild(item1);
            tr2.appendChild(item2);
        } 
        table.appendChild(tr1);
        table.appendChild(tr2);
        res.appendChild(table);
        res.appendChild(document.createElement("br"))            
    }
}

//function to spit out data into groups when the Non-header version is selected.
function publish_non_header(valArray) {
    //functions only requires FP2 converted array (valArray).
    clearResults()
    const resDct = {}
    //goes mapping data and arrays
    const goesMapping = document.getElementById("gmapping").value
    const groupVals = goesMapping.split(";")
    //data to use
    const goesTime = valArray.slice(0,2);
    resDct["Goes Time Information"] = goesTime;
    const data = valArray.slice(2,valArray.length);
    //Make sure number of channels defined in GOES mapping matches what is in valArray.
    const channelsFromMapping = Number(groupVals[groupVals.length-1].split("..")[1]) - 1;
    if ( channelsFromMapping != data.length) {
        alert(`The number of channels calculated from the GOES mapping is ${channelsFromMapping} and the number of channels telemetered is ${data.length}. GOES string must match what is telemetered. Check that the correct mapping is used and that correct header version is selected. If still inconsistant, logger configuration may be wrong.`)
        throw("miss-mach GOES mapping confige")
    }
    //create data dict for display. Dict contains all groups and arrays of data assigned to those groups
    for (let i in groupVals) {
        const groupArr = groupVals[i].split(",")
        const groupName = groupArr[0]
        const startEndChans = groupArr[1].split("..").map(item => Number(item))
        const index = Array(startEndChans[1] - startEndChans[0] + 1).fill().map((_, idx) => startEndChans[0] + idx)
        index = index.map(item => item -2)
        const dataVals = []  
        for (let j in index){
            dataVals.push(data[index[j]])
        }
        resDct['Group '+ groupName] = dataVals
    }
    //dispay results
    showTime()
    const res = document.getElementById("results")
    for (tbl in resDct) {
        const displayName = document.createElement("h3");
        displayName.textContent = tbl +":"
        res.appendChild(displayName);
        const table = document.createElement("table")
        table.className = "alltables"

        const tr1 = document.createElement("tr")
        const header1 = document.createElement("th");
        header1.textContent = "AWDB Channel in Group:"
        tr1.appendChild(header1)
        const tr2 = document.createElement("tr")
        const header2 = document.createElement("th");
        header2.textContent = "Sensor Output:"
        tr2.appendChild(header2);

        const grpVals = resDct[tbl];
        for (i in grpVals){
            
            const item1 = document.createElement("td");
            if (tbl == "Goes Time Information") {
                if (Number(i) == 0 ){
                    item1.textContent = "Julian Day"
                } else {
                    item1.textContent = "Hour"
                }
            } else {
                item1.textContent = Number(i) + 1; 
            }
            item1.style = "width: 100px";
            const item2 = document.createElement("td");
            item2.textContent = grpVals[i];
            item2.style = "width: 100px";
            tr1.appendChild(item1);
            tr2.appendChild(item2);
        } 
        table.appendChild(tr1);
        table.appendChild(tr2);
        res.appendChild(table);
        res.appendChild(document.createElement("br"))            
    }
}


//function for printing the FP2 converted data array as a simple table when no mapping is used or there is an error in the publish_non_header or publish_header functions.
function printGoesString(valArray) {
    clearResults()
    showTime()
    const res = document.getElementById("results")
    const title = document.createElement("h3")
    title.textContent = "Converted String:"
    let table = document.createElement("Table");
    table.className = "alltables"
    let hdr = document.createElement("tr")
    let head1 = document.createElement("th")
    head1.textContent = "Index"
    let head2 = document.createElement("th")
    head2.textContent = "Value"
    hdr.appendChild(head1)
    hdr.appendChild(head2)
    table.appendChild(hdr)
    for (let i in valArray){
        let row = document.createElement("tr");
        let item1 = document.createElement("td");
        item1.textContent = i
        item1.style = "width: 100px"
        let item2 = document.createElement("td");
        item2.textContent = valArray[i];
        item2.style = "width: 100px"
        row.appendChild(item1);
        row.appendChild(item2);
        table.appendChild(row);
    }       
    res.appendChild(title)
    res.appendChild(table)
}   
//function to recalulate data when a different timestep is selected. Only used when publish_header function was successful.
function reCal(){
    const valArray = convertString();
    const timeStep = Number(document.getElementById("transhour").value)
    const res = document.getElementById("results")
    while (res.childElementCount > 2) {
        res.removeChild(res.lastChild);
    }
    publish_header(valArray, timeStep);
}

//function to clear and populate the Multitranmission GOES timestep selection menu. Only used when publish_header was successful.
function multiTransMenu (valArray, TimeStep) {
    clearResults()
    const res = document.getElementById("results")
    const transMenu = document.createElement("Select")
    transMenu.id = "transhour"
    const transLable = document.createElement("label")
    transLable.for="transhour"
    transLable.textContent = "Choose hour (24-hour clock) to view: "
    const headRes = document.getElementById("headerversion").value
    const header = valArray.slice(0,2);
    const numOfTimeSteps = header[0];
    for (var i = 1; i<=Number(numOfTimeSteps); i++){
        const opt = document.createElement('option');
        const dataAndTime = valArray.slice(2,valArray.length+1)
        const goesTime = dataAndTime.slice(0 + (2+header[1]) * (i -1),0 + (2 + header[1]) * (i -1) + 2);
        opt.value = i;
        opt.textContent = goesTime[1];
        if (i == TimeStep){
            opt.selected;
        }
        transMenu.appendChild(opt);
    }
    res.appendChild(transLable);
    res.appendChild(transMenu);
}




//function to copy GOES mapping from CODCO tab to the String Converter Tab
export function printMapping(mapping, id) {
    const mapText = document.getElementById(id)
    mapText.textContent = mapping
}

//Meta function to convert FP2 string and display results given user selection and errors encountered.
function resultsFP2(){
    const valArray = convertString();
    const headRes = document.getElementById("headerversion").value
    const goesMapping = document.getElementById("gmapping").value
    
    if ((goesMapping != '') & (headRes == 'none')) {
        alert("Select \"header\" or \"non header version\" to map values to groups.")
        throw("need to select a header version")
    }
    // printGoesString(valArray)
    try { //Try to use more complex FP2 string to mapping functions based on user impute. 
        if (goesMapping == ''){
            printGoesString(valArray)
        } else {
            if (headRes == "header") {
                multiTransMenu (valArray, 1)
                publish_header(valArray, 1)
                document.getElementById("transhour").addEventListener('change', () => {
                    reCal()
                })
            } else {
                publish_non_header(valArray)
            }

        }
    } catch (error){ //if error in above "try" statement, prints string as simple table using "printGoesString" function.
        console.log(error)
        try {
            printGoesString(valArray)
            alert("Error in GOES mapping. Results will be printed as a raw table of values.")
        } catch { //if issues in simple string conversion and display print alert and exit function.
            alert("something wrong with GOES string. Make sure to remove any white spaces.")
            throw("Error in printGoesString function. Likely error in copying string from GOES DCS website." )
        }
    }
}
