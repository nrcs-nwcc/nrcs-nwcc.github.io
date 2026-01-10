import './fp2_converter.js'
import './logger_programs/SCAN_2026_program.js'
// import './fp2_converter'
// import './fp2_converter'

// customElements.define('goes-container', GoesMainPage)
class GoesContainer extends HTMLElement {
    // static pages = ['fp2-converter','colorado-2025-2026-program', 'SCAN-2026-program']
    constructor() {
        super()
        this.pageNames =  ['fp2-converter','colorado2025-program', 'scan-2026-program']
        // this.internals_ = this.attachInternals()
    }

    connectedCallback() {
        // console.log(this.pages)
        this.innerHTML = this.loadStyles() + this.loadHtml()
        this.tabElements = this.pageNames.map(name => {
            console.log(name)
            return document.createElement(name)

        })
        this.tabElements.forEach(element => this.attachElement(element))
    }

    disconnectedCallback() {
        Array.from(this.querySelectorAll('.page-navigation button')).forEach(button => button.removeEventListener('click', navButtenEvent))
    }

    attachElement(element) {
        this.tabElements.forEach(element => {
            if (element.nagButton) {
                const button = element.nagButton()
                this.querySelector('.page-navigation').appendChild(button)
                button.addEventListener('click', navButtenEvent)
            }
        })
        this.querySelector('.tab-window').appendChild(element)
    }

    navButtenEvent = (event) => {
        console.log('click')
    }

    loadHtml() {
        return `
            <div class="page-navigation">
                <button class="tablinks active" id = "FP2" value="FP2_converter">FP2 Converter</button>
            </div>
            <!--FP2 Converter Tab html elements-->
            <div class='tab-window'></main>        
        `
    }

    loadStyles() {
        return `
            <style>
                .alltables{
                    font-family: Arial, Helvetica, sans-serif;
                    border-collapse: collapse;

                }
                .alltables td, #explanation th {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                .alltables tr:nth-child(even){
                    background-color: #f2f2f2;
                }
                .alltables th {
                    padding-top: 12px;
                    padding-bottom: 12px;
                    text-align: left;
                    background-color: rgb(56, 56, 56);
                    color: white;
                }
                /* Style the tab */
                .page-navigation {
                    display: flex;
                    overflow: hidden;
                    background-color: rgb(36, 112, 169);
                    width: 100%;
                    height: 60px;
                }
            
                /* Style the buttons inside the tab */
                .page-navigation button {
                    background-color: inherit;
                    text-align: center;
                    vertical-align: center;
                    float: left;
                    border: 1px solid rgb(131, 131, 131);
                    outline: none;
                    cursor: pointer;
                    transition: 0.3s;
                    font-size: 17px;
                    color: white;
                    flex-grow: 1;
                    /* width:33.3333%; */
                    height: inherit;
                }
            
                /* Change background color of buttons on hover */
                .page-navigation button:hover {
                    background-color: rgb(86, 140, 169);
                }
            
                /* Create an active/current tablink class */
                .page-navigation button.active {
                    background-color: rgb(52, 83, 100);
                }
            
                /* Style the tab content */
                .tabcontent {
                    display: none;
                    padding-top: 0px;
                    width: 100%;
                    height: Auto;
                }
                .sensor-management-table{
                    border-collapse: collapse;
                    border: 2px solid rgb(140 140 140);
                    font-family: sans-serif;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                }
                .sensor-management-table tr, th {
                    min-width: 100px
                }
                .sensor-management-table th{
                    background-color: #505050;
                    color: #fff;
                }
                .sensor-management-table td,th {
                    border: 1px solid rgb(160 160 160);
                    padding: 8px 10px;
                }


                .sensor-management-table td {
                    text-align: center;
                }
                .sensor-management-table tr:nth-child(even) {
                    background-color: #dddddd;
                }

            </style>        
        `
    }  
}


customElements.define('goes-container', GoesContainer)