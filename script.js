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

function round(num) {
    return Math.floor(num * 100 + .5) / 100;
}

function inverse() {
    const calcDisplay = document.querySelector('.display');
    const parsedStr = calcDisplay.textContent.split(/([+\-*\/\^])/);
    calcDisplay.textContent = '';
    for (let i = 0; i < parsedStr.length-1; i++) {
        calcDisplay.textContent += parsedStr[i];
    }
    calcDisplay.textContent += round(1 / +parsedStr[parsedStr.length-1]);
}

function write() {
    const calcDisplay = document.querySelector('.display');
    const char = this.firstChild.textContent;
    let workArray = [];
    switch (true) {
        case /\./.test(char):
            disablePeriod();
            calcDisplay.textContent += char;
            break;
        case /[+\-*\/\^]/.test(char):
            if (/(\d*(\.\d*)?)[+\-*\/\^](\d*(\.\d*)?)/.test(calcDisplay.textContent)) {
                operate(char);
            } else if (/(\d*(\.\d*)?)[^+\-*\/\^]/.test(calcDisplay.textContent)) {
                disablePeriod(false);
                calcDisplay.textContent += char;
            }
            break;
        default:
            workArray = (calcDisplay.textContent + char).split(/([+\-*\/\^])/);
            workArray = workArray.map(element => {
                return (/[+\-*\/\^]/.test(element)) ? element : round(+element);
            });
            calcDisplay.textContent = workArray.join('');
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
            result = round(+parsedStr[0] * +parsedStr[2]);
            break;
        case '/':
            result = round (+parsedStr[0] / +parsedStr[2]);
            break;
        case '^':
            result = round ((+parsedStr[0]) ** +parsedStr[2]);
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

function overflowTest(string) {
    return (string.length > 13) ? 'Overflow error' : string;
}

window.addEventListener('load',initCalculator);