

class Fp2Element extends HTMLElement {
    static state = []

    constructor() {
        super()
        this.internals_ = this.attachInternals()
    }

    connectedCallback() {
        this.innerHTML = loadHtml()
    }

    disconnectedCallback() {

    }

    loadHtml() {
        return html`
            <h1>FP2 GOES String Converter</h1>
            <p>This utility converts a GOES string to engineering units. The string can contain the DCS appended parentheses at the beginning; the script ignores them. Extra spaces before or after the string must be removed. If a GOES mapping string and header information is provided the utility will attempt to separate the values into the channels and groups outlined by the mapping string.</p>
            <form>
                <label for="goesString">GOES String:</label><br>
                <input type="text" id="goesString" name="goesString" style="width: 90%"><br><br>
                <label for="gmapping">GOES to AWDB Mapping (optional):</label>
                <input type="text" id="gmapping" name="gmapping" style="width: 90%"><br><br>
                <label for="headerversion">Select Header Type (optional):</label><br>
                <select name="headerversion" id="headerversion">
                        <option value="none" selected></option>
                        <option value="noheader">No header used</option>
                        <option value="header">Header Used (multiple time steps per transmission)</option>
                </select>
                <br><br>
                <button type="button">Submit</button>
                <button type="button">Clear Results</button>
            </form>
            <h2>GOES converted String Results:</h2>
            <p>List of things to check:</p>
            <ul>
                <li>Check hour and relative julia day</li>
                <li>Check that the data you expect is coming in</li>
                <li>Check the data GOES mapping string properly maps the data with no errors</li>
                <li>Check quality of data</li>
            </ul>
            <div id="results"></div>              
        `
    }
}