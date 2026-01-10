export function buildGOESCodeForm(elements, container, id) {
    const groupTables = {}
    const tableNumbers = new Set(elements.map(item => item.group))
    tableNumbers.forEach(ele =>  {
        const tableContainer = document.createElement('div')
        const tableName = document.createElement('h3')
        tableName.textContent = `Group ${ele} Elements`
        tableContainer.id = `${id}-tbl${ele}`
        tableContainer.classList = 'group-container'
        tableContainer.dataset.value = ele
        tableContainer.appendChild(tableName)
        container.appendChild(tableContainer)
        groupTables[ele] = tableContainer
    })
    elements.forEach(item => {
        const name = item.name
        const type = item.type
        const options = item.options
        const channels = item.channels
        const group = item.group
        const depends = item.depends
        const formula = item.formula
        const selected = item.selected
        const itemDiv = document.createElement('div')
        const label = document.createElement('label')
        label.textContent = `${name}: `
        label.setAttribute('for', `${id}-${name}`)
        if (type === 'checkbox' && !depends) {
            const input = document.createElement('input')
            input.id = `${id}-${name}`
            input.value = channels
            input.type = 'checkbox'
            input.checked = selected
            itemDiv.append(label, input)
        } else if (type === 'checkbox' && depends) {
            const input = document.createElement('input')
            const dependentContainer = container.querySelector(`#${id}-${depends}`)
            input.id = `${id}-${name}`
            input.value = dependsOperator(formula, dependentContainer.value)
            input.type = 'checkbox'
            itemDiv.style.display = 'none'
            dependentContainer.addEventListener('change', (event) => {
                if (event.target.value === '0') {
                    itemDiv.style.display = 'none'
                    input.checked = false
                } else {
                    itemDiv.style.display = 'block'
                    input.checked = true
                }
                console.log(event.target.value)
                console.log(itemDiv)
            })
            itemDiv.append(label, input)
        } else if (type === 'select'  && !depends) {
            const select = document.createElement('select')
            select.name = `${name}: `
            select.id = `${id}-${name}`
            const opt1 = document.createElement('option')
            opt1.value = 0
            opt1.textContent = ''
            select.appendChild(opt1)
            console.log(options)
            options.forEach((optName, index) => {
                const opt = document.createElement('option')
                if (optName === selected) {
                    opt.selected = true
                }
                
                opt.value = channels[index]
                opt.textContent = optName
                select.appendChild(opt)
            })
            itemDiv.append(label, select)
        } else if (type === 'select'  && depends) {
            console.log('not implemented')
        }
        groupTables[group].appendChild(itemDiv)
    })
}


function dependsOperator(operString, val) {
    const number = operString.match(/(\d+\.\d+|\d+)/g)
    const oper = operString.match(/\D/g)
    let result
    switch (oper) {
        case '/':
            result = val / number
        case '*':
            result = val * number
        case '+':
            result = val + number
        case '-':
            result = val - number
        default:
            result = val
    }
    return result
}

export function getGoesMappingString(groupElementContainers, defaultChannelCountsForGroup1) {
    const firstOptChannel = defaultChannelCountsForGroup1
    let currentChannel = 1
    let goesString = ''
    groupElementContainers.forEach((groupC, index) => {
        // console.log(groupC)
        const startChannel = currentChannel
        
        
        const elementInputs = groupC.querySelectorAll('div input, div select')
        elementInputs.forEach(ele => {
            if (ele.tagName === "INPUT" && ele.checked) {
                const numbOfChan = Number(ele.value)
                currentChannel += numbOfChan
            } else if (ele.tagName === "SELECT") {
                console.log(ele.value)
                const numbOfChan = Number(ele.value)
                currentChannel += numbOfChan                    
            }
        })
        if ((startChannel + 1 < currentChannel) || index === 0) {
            if (index === 0) { currentChannel += firstOptChannel}
            goesString += `${groupC.dataset.value},${startChannel + 1}...${currentChannel};`
        }

    })
    return goesString
}