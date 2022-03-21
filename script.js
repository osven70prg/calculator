/*
Remove JavaScript notice from DOM, create display and 
board divs, populate board with buttons and assign them 
content, function and color, and set the display to 0
*/
function initCalculator() {
    const keyboardButtons = ['C,clearDisplay,0', '←,backSpace,1', '1/x,inverse,2', '/,write,2', '7,write,3', '8,write,3', '9,write,3', '*,write,2', '4,write,3', '5,write,3', '6,write,3', '-,write,2', '1,write,3', '2,write,3', '3,write,3', '+,write,2', '^,write,2', '0,write,3', '.,write,3', '=,operate,4'];
    const buttonColors = ['#cc4444aa', '#773333aa', '#334466aa', '#333333aa', '#777777aa'];
    const calculator = document.querySelector('.calculator');
    calculator.textContent = '';
    const display = document.createElement('div');
    display.className = 'display';
    calculator.appendChild(display);
    const board = document.createElement('div');
    board.className = 'board';
    calculator.appendChild(board);
    keyboardButtons.forEach(keyboardButton => {
        const [buttonText, buttonFunction, buttonColorIndex] = keyboardButton.split(',');
        const button = document.createElement('button');
        button.style.backgroundColor = buttonColors[buttonColorIndex];
        button.textContent = buttonText;
        board.appendChild(button);
        button.addEventListener('click', window[buttonFunction]);
    });
    display.textContent = '0';
    return;
}

/*
Set display to zero, reset the class flags and enable 
period key
*/
function clearDisplay() {
    const display = document.querySelector('.display');
    display.classList.remove('result');
    display.classList.remove('error');
    disablePeriodKey(false);
    display.textContent = '0';
    return;
}

/*
Delete the last position in the display, if it is a
period, enable period key, and if there is no more data, 
set it to zero 
*/
function backSpace() {
    const display = document.querySelector('.display');
    if (/.*result|.*error/.test(display.className)) {
        clearDisplay();
    }
    if (display.textContent.charAt(display.textContent.length-1) === '.') {
        disablePeriodKey(false);
    }
    display.textContent = (display.textContent.length > 1) ? 
                    display.textContent.slice(0,display.textContent.length-1) : '0';
    return;
}

/*  
Remove result class flag from the display. Return without
do anything if there is an error message. If the operand is
zero, return 'infinity' error and set the error class flag.
If there is an operator but not a 2nd operand, function
exits without performing any further operation,
otherwise it returns the result at the right place into
the display context 
*/
function inverse() {
    const display = document.querySelector('.display');
    display.classList.remove('result');
    if (/.*error/.test(display.className)) {
        return;
    }
    const parsedDisplay = parseDisplay();
    if (parsedDisplay[parsedDisplay.length-1] === '0') {
        display.textContent = 'infinity';
        display.className += ' error';
    } else if (!(parsedDisplay[1] && !parsedDisplay[2])) {
        display.textContent = 
                        (parsedDisplay[2]) ? parsedDisplay[0] + parsedDisplay[1] : '';
        display.textContent += round(1 / +parsedDisplay[parsedDisplay.length-1]);
        display.textContent = validateLength(display.textContent);
    }
    return;
}
        
/* 
Write on the display following some rules:
1.  If the result class flag is set and the input is a 
    period or a number, or the error class flag is set, 
    clear the display and continue.
2.  Remove the result class flag.
3.  If the input is a period, write it and disable the 
    period key.
4.  If the input is an operator, enable period key. If 
    there are already two operands on the display, pass 
    the operator to the operate function key. If there 
    are no other operators on the display, write the 
    operator on it. 
5.  If the input is a number, just write it. 
*/
function write() {
    const display = document.querySelector('.display');
    const input = this.firstChild.textContent;
    if ((/.*result/.test(display.className) && /[\d\.]/.test(input) || 
                    /.*error/.test(display.className))) {
        clearDisplay();
    }
    display.classList.remove('result');
    const parsedDisplay = parseDisplay();
    switch (input) {
        case '.':
            disablePeriodKey();
            display.textContent += input;
            display.textContent = validateLength(display.textContent);
            break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '^':
            disablePeriodKey(false);
            switch (parsedDisplay.length) {
                case 1:
                    display.textContent += input;
                    display.textContent = validateLength(display.textContent);
                    break;
                case 3:
                    operate(input);
                    break;
            }
            break;
        default:
            parsedDisplay[parsedDisplay.length-1] += input;
            if ((/\d*\.\d\d\d/).test(parsedDisplay[parsedDisplay.length-1])) {
                break;
            }
            if ((/\d*\.0/).test(parsedDisplay[parsedDisplay.length-1])) {
                display.textContent = validateLength(parsedDisplay.join(''));
                break;
            } else {
            parsedDisplay[parsedDisplay.length-1] = 
                            +parsedDisplay[parsedDisplay.length-1];
            display.textContent = validateLength(parsedDisplay.join(''));
            }
            break;
    }
    return;
}

/*
Get an operator as entry. If the error class flag is set, 
clear the display. If there are 2 operands and an operator,
calculate the result. Add the operator passed if it is not an 
equal sign. Set the result class flag to the display 
*/
function operate(operator) {
    const display = document.querySelector('.display');
    const parsedDisplay = parseDisplay();
    if (/.*error/.test(display.className)) {
        clearDisplay();
    }
    if (parsedDisplay.length === 3) {
        let result = 0;
        if (typeof operator !== 'string') {
            operator = '=';
        }
        switch (parsedDisplay[1]) {
            case '+':
                result = +parsedDisplay[0] + +parsedDisplay[2];
                break;
            case '-':
                result = +parsedDisplay[0] - +parsedDisplay[2];
                break;
            case '*':
                result = round(+parsedDisplay[0] * +parsedDisplay[2]);
                break;
            case '/':
                result = round(+parsedDisplay[0] / +parsedDisplay[2]);
                break;
            case '^':
                result = round((+parsedDisplay[0]) ** +parsedDisplay[2]);
                break;
        }
        if (operator === '=') {
            display.className += ' result';
            display.textContent = validateLength(result.toString());
        } else {
            display.textContent = validateLength(result.toString() + operator);
        }
    }
    return;
}

/*  
Parse the display and return an array of three strings: 
['1st_operand', 'operator', '2nd_operand'] 
*/
function parseDisplay() {
    const display = document.querySelector('.display');
    let tempWorkArray = display.textContent.split(/([+\-*\/\^])/);
    if (tempWorkArray[0] === '') {
            tempWorkArray[0] = '-' + tempWorkArray[2];
            tempWorkArray.splice(1,2);
        }
    return tempWorkArray;
}

/*  
Round outputs to 2 decimal places 
*/
function round(num) {
    return Math.floor(num * 100 + .5) / 100;
    }
    
/*  
Disable or enable the period key 
*/
function disablePeriodKey(status = true) {
    const buttons = document.querySelectorAll('.board > button');
    buttons.forEach(button => {
        if (button.textContent === '.') {
            button.disabled = status;
        }
    });
}
    
/*  
Send an overflow error message when display data goes
over 11 characters long and set the error class flag
*/
function validateLength(string) {
    if (string.length > 11) {
        const display = document.querySelector('.display');
        display.className += ' error';
        string = 'overflow!';
        }
    return string;
}

/*
Launch the calculator when the page is loaded
*/
window.addEventListener('load',initCalculator);