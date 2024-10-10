import { tabClick, toFP2, printMapping } from './GOES_string_converter_entry.js'
 
export function codcoJuddEntry() {
   // add menu entry
   const tabBar = document.getElementById('topNav')
   const juddButton = document.createElement('button')
   juddButton.classList = 'tablinks'
   juddButton.id = 'CODCO_mapping_judd'
   juddButton.textContent = 'Colorado GOES Mapping JUDD'
   juddButton.value = 'CODCO_GOES_mapping_Judd'
   juddButton.addEventListener('click', (event) => {
       tabClick(event)
   })
   tabBar.appendChild(juddButton)

   // add body html entry
   const mainSection = document.getElementsByTagName('main')[0]
   const juddContainer = document.createElement('div')
   juddContainer.id = 'CODCO_GOES_mapping_Judd'
   juddContainer.style = 'display:none'
   juddContainer.innerHTML = juddProgramHTML
   mainSection.appendChild(juddContainer)

   // setup event listeners
   setupEventListeners()

   // generate initial mapping code
   CODCOgenerateMapping_judd()
}

function setupEventListeners() {
    // assign input event listeners.
    const inputElements = document.querySelectorAll('#CODCO_GOES_mapping_Judd input')
    Array.from(inputElements).forEach(item => {
        item.addEventListener('change', () => {
            CODCOgenerateMapping_judd()
        })
    })
    // assign input event selection event listeners.
    const selectionElements = document.querySelectorAll('#CODCO_GOES_mapping_Judd select')
    Array.from(selectionElements).forEach(item => {
        item.addEventListener('change', () => {
            CODCOgenerateMapping_judd()
        })
    })
    // assign function buttons
    const buttonElements = document.querySelectorAll('#CODCO_GOES_mapping_Judd button')
    Array.from(buttonElements).forEach(item => {
        if (item.textContent === 'Copy to FP2 Converter Tab') {
            item.addEventListener('click', () => { toFP2('goes_mapping_string_judd') })
        } 
    })   
}





//CODCO string mapping function. Generates a string mapping based on current CODCO program.
function CODCOgenerateMapping_judd() {
    group16params_Judd()
    rhPrams_Judd()
    //get form results
    const formRes = document.getElementById("mappingForm_judd").children
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
    let g1end = 13+ resDct["Aux_Pillow_judd"] + resDct["Aux_Prec_judd"]
    let g1String = `1,${g1Start}..${g1end}`
    //group 2
    let g2Start = g1end
    let g2end = g2Start + resDct["soils_judd"] * 2
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
    let g3end = g3Start + resDct["wind_judd"] + resDct["solar_judd"] + resDct["RH_judd"] + resDct["RH_Temp_judd"]
    let g3String
    if (g3end > g3Start) {
        g3end
        g3Start += 1
        g3String = `;3,${g3Start}..${g3end}`
    } else {
        g3String = ''
    }           
    //group 16
    let g16Start = g3end
    let g16end = g16Start + resDct["Snow_Depth_params_judd"] + resDct["Standard_Parameters_judd"]
    let g16String
    if (g16end > g16Start) {
        g16end
        g16Start += 1
        g16String = `;16,${g16Start}..${g16end}`
    } else {
        g16String = ''
    }  
    //compile. Concatenate all group strings to produce final string 
    const finalString = g1String + g2String + g3String +g16String
    printMapping(finalString, "goes_mapping_string_judd")
}

//Special function for CODCO mapping tab where Snow_Depth_params are only displayed if group 16  Standard_Parameters is selected
function group16params_Judd(){
    if (document.getElementById("Standard_Parameters_judd").checked) {
        document.getElementById("Snow_Depth_params_judd").style.display = "inline"
        document.getElementById("Snow_Depth_params_labels_judd").style.display = "inline"
    } else {
        document.getElementById("Snow_Depth_params_judd").style.display = "none"
        document.getElementById("Snow_Depth_params_labels_judd").style.display = "none"
        document.getElementById("Snow_Depth_params_judd").checked = false
    }
}


//Special function for CODCO mapping tab where RH temp is only displayed if RH is selected
function rhPrams_Judd(){
    if (document.getElementById("RH_judd").checked) {
        document.getElementById("RH_Temp_judd").style.display = "inline"
        document.getElementById("RH_Temp_label_judd").style.display = "inline"
    } else {
        document.getElementById("RH_Temp_judd").style.display = "none"
        document.getElementById("RH_Temp_label_judd").style.display = "none"
        document.getElementById("RH_Temp_judd").checked = false
    }
}

const juddProgramHTML = `
    <!-- CODCO judd GOES Mapping HTML elements-->
        <h1>CODCO GOES Mapping Generator for judd JUDD Program</h1>
        <form id="mappingForm_judd">
            <h3>Group 1 Extended Sensors</h3>
            <label for="Aux_Prec_judd"> Auxiliary Precipitation TXD</label>
            <input type="checkbox" id="Aux_Prec_judd" value="1" ><br>
            <label for="Aux_Pillow_judd"> Auxiliary Pillow TXD</label>
            <input type="checkbox" id="Aux_Pillow_judd" value="1" ><br>
            <h3>Group 2 Extended Sensors - Soils</h3>
            <select name="soils_judd" id="soils_judd" >
                <option value="0" selected></option>
                <option value="1">One soil sensor</option>
                <option value="2">Two soil sensors</option>
                <option value="3">Three soil sensors</option>
                <option value="4">Four soil sensors</option>
                <option value="5">Five soil sensors</option>
            </select>
            <h3>Group 3 Extended Sensors</h3>
            <label for="wind_judd"> Wind</label>
            <input type="checkbox" id="wind_judd" value="3" ><br>
            <label for="solar"> Solar</label>
            <input type="checkbox" id="solar_judd" value="8" ><br>
            <label for="RH_judd_judd"> RH</label>
            <input type="checkbox" id="RH_judd" value="4" ><br>
            <label for="RH_Temp_judd" id="RH_Temp_label_judd" style="display:none"> RH Temp</label>
            <input type="checkbox" id="RH_Temp_judd" value="1" style="display:none" ><br>
            <h3>Group 16 Diagnostic Parameter Options</h3>
            <label for="Standard_Parameters_judd"> Standard Diagnoistic Parameters</label>
            <input type="checkbox" id="Standard_Parameters_judd" checked value="6" ><br>
            <label for="Snow_Depth_params_judd" id="Snow_Depth_params_labels_judd">Snow Depth Diagnostic Parameters</label>
            <input type="checkbox" id="Snow_Depth_params_judd" checked value="2" ><br>
        </form>
        <h1>GOES Mapping Code:</h1>
        <h3 id="goes_mapping_string_judd"></h3>
        <button>Copy to FP2 Converter Tab</button>
`