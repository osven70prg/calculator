function initCalculator() {
    const kbdKeys = ['C,clearDisplay', '←,backSpace', '1/x,inverse', '/,write', '7,write', '8,write', '9,write', '*,write', '4,write', '5,write', '6,write', '-,write', '1,write', '2,write', '3,write', '+,write', '^,write', '0,write', '.,write', '=,operate'];
    const display = document.querySelector('.display');
    const board = document.querySelector('.board');
    kbdKeys.forEach(key => {
        const [txt, func] = key.split(',');
        const btn = document.createElement('button');
        btn.textContent = txt;
        board.appendChild(btn);
        btn.addEventListener('click', window[func]);
    });
    display.textContent = '0';
    return;
}

function disablePeriod(status = true) {
    const btns = document.querySelectorAll('.board > button');
    btns.forEach(btn => {
        if (btn.textContent === '.') {
            btn.disabled = status;
        }
    });
}

function clearDisplay() {
    const calcDisplay = document.querySelector('.display');
    calcDisplay.textContent = '0';
    return;
}

function backSpace() {
    const calcDisplay = document.querySelector('.display');
    calcDisplay.textContent = (calcDisplay.textContent.length > 1) ? 
                    calcDisplay.textContent.slice(0,calcDisplay.textContent.length-1) : '0';
    return;
}

function inverse() {
    const calcDisplay = document.querySelector('.display');
    const parsedStr = calcDisplay.textContent.split(/([+\-*\/\^])/);
    calcDisplay.textContent = '';
    for (let i = 0; i < parsedStr.length-1; i++) {
        calcDisplay.textContent += parsedStr[i];
    }
    calcDisplay.textContent += 1 / +parsedStr[parsedStr.length-1];
}

function write() {
    const calcDisplay = document.querySelector('.display');
    const char = this.firstChild.textContent;
    let tempStr, tempArr = [];
    switch (true) {
        case /\./.test(char):
            disablePeriod();
            calcDisplay.textContent += char;
            break;
        case /[+\-*\/\^]/.test(char):
            if (/([0-9]*(\.[0-9]*)?)[+\-*\/\^]([0-9]*(\.[0-9]*)?)/.test(calcDisplay.textContent)) {
                operate(char);
            } else if (/([0-9]*(\.[0-9]*)?)[^+\-*\/\^]/.test(calcDisplay.textContent)) {
                disablePeriod(false);
                calcDisplay.textContent += char;
            }
            break;
        default:
            tempStr = calcDisplay.textContent + char;
            tempArr = tempStr.split(/([+\-*\/\^])/);
            for (let i = 0; i < tempArr.length; i++) {
                tempArr[i] = tempArr[i].replace(/\b(0(?!\b))+/g,'');
            };
            calcDisplay.textContent = tempArr.join('');
            break;
    }
    return;
}

function operate(operator) {
    const calcDisplay = document.querySelector('.display');
    const parsedStr = calcDisplay.textContent.split(/([+\-*\/\^])/);
    if (parsedStr.length === 3) {
        let result = 0;
        if (typeof operator !== 'string') {
            operator = this.firstChild.textContent;
        }     
        switch (parsedStr[1]) {
        case '+':
            result = +parsedStr[0] + +parsedStr[2];
            break;
        case '-':
            result = +parsedStr[0] - +parsedStr[2];
            break;
        case '*':
            result = +parsedStr[0] * +parsedStr[2];
            break;
        case '/':
            result = +parsedStr[0] / +parsedStr[2];
            break;
        case '^':
            result = (+parsedStr[0]) ** +parsedStr[2];
            break;
        }
        calcDisplay.textContent = ((operator === '=') ? result.toString() : result.toString() + operator); 
        disablePeriod(false);
        if (operator === '=') {
            document.addEventListener('click',() => {
            clearDisplay();
            document.removeEventListener('click',this)},{once: true, capture: true});
        }
    } 
    return;
}

window.addEventListener('load',initCalculator);