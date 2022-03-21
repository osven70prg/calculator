/*  Remove JavaScript notice from DOM, create display and 
    board divs, and board buttons assigning them content, 
    function and color, and set the display to 0 */
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

/*  Disable or enable the period key */
function disablePeriodKey(status = true) {
    const buttons = document.querySelectorAll('.board > button');
    buttons.forEach(button => {
        if (button.textContent === '.') {
            button.disabled = status;
        }
    });
}

/*  Set display to zero, reset the class flag and enable 
    period key*/
function clearDisplay() {
    const display = document.querySelector('.display');
    display.classList.remove('result');
    disablePeriodKey(false);
    display.textContent = '0';
    return;
}

/*  Delete the last position in the display, if it is a
    period, enable period key, and if there is no more data, 
    set it to zero */
function backSpace() {
    const display = document.querySelector('.display');
    if (display.textContent.charAt(display.textContent.length-1) === '.') {
        disablePeriodKey(false);
    }
    display.textContent = (display.textContent.length > 1) ? 
                    display.textContent.slice(0,display.textContent.length-1) : '0';
    return;
}

/*  Parse the display and return an array of three strings: 
    ['1st_operand', 'operator', '2nd_operand'] */
function parseDisplay() {
    const display = document.querySelector('.display');
    return display.textContent.split(/([+\-*\/\^])/);
}

/*  Round outputs to 2 decimal places */
function round(num) {
    return Math.floor(num * 100 + .5) / 100;
}

/*  Parse and store the display content in three elements
    if they exist: [0] 1st operand, [1] operator, [2] 2nd operand.
    If there is an operator but no 2nd operand, function
    exits without performing any further operation,
    otherwise it returns the result at the right place into
    the display context */
function inverse() {
    const display = document.querySelector('.display');
    const parsedDisplay = parseDisplay();
    if (!(parsedDisplay[1] && !parsedDisplay[2])) {
        display.textContent = 
                        (parsedDisplay[2]) ? parsedDisplay[0] + parsedDisplay[1] : '';
        display.textContent += round(1 / +parsedDisplay[parsedDisplay.length-1]);
        display.textContent = validate(display.textContent);
    }
    return;
}

/* Write on the display following some rules:
    1.  If the class flag is set and the input is a number, 
        clear the display and continue.
    2.  If the input is a period, write it and disable 
        period key.
    3.  If the input is an operator, enable period key. If 
        there already are two operands on the display, pass 
        the operator to the operate function key. If there 
        are no other operators on the display, write the 
        operator on it. 
    4.  If the input is a number, just write it. */
function write() {
    const display = document.querySelector('.display');
    const char = this.firstChild.textContent;
    if ( /.*result/.test(display.className) && /[^+\-*\/\^]/.test(char)) {
        clearDisplay();
    }
    display.classList.remove('result');
    const parsedDisplay = parseDisplay();
    switch (char) {
        case '.':
            disablePeriodKey();
            display.textContent += char;
            display.textContent = validate(display.textContent);
            break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '^':
            switch (parsedDisplay.length) {
                case 1:
                    display.textContent += char;
                    validate(display.textContent);
                    break;
                case 3:
                    operate(char);
                    break;
            }
            break;
        default:
            parsedDisplay[parsedDisplay.length-1] += char;
            parsedDisplay[parsedDisplay.length-1] = +parsedDisplay[parsedDisplay.length-1];
            if ((/\d*\.\d\d\d/).test(parsedDisplay[parsedDisplay.length-1])) {
                backSpace();
                break;
            }
            display.textContent = validate(parsedDisplay.join(''));
            break;
    }
    return;
}

/*  Get an operator as entry and output the operation result 
    on the display.
    Add the operator passed if it is not an equal sign. 
    Set a class flag to the display */
function operate(operator) {
    const display = document.querySelector('.display');
    const parsedDisplay = parseDisplay();
    if (display.textContent === 'Infinity' || display.textContent === 'overflow') {
        display.textContent = '0';
    }
    if (parsedDisplay.length === 3) {
        let result = 0;
        if (typeof operator !== 'string') {
            operator = this.firstChild.textContent;
        }
        console.log('operator:', operator)
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
        display.textContent = validate(((operator === '=') ? 
                        result.toString() : result.toString() + operator));
        if (operator === '=') {
            const display = document.querySelector('.display');
            display.className += ' result';
        }
    } 
    return;
}
/*  Send an overflow error message when display data goes
    over 13 characters long. */
function validate(string) {
    if (string.length > 13) {
        const display = document.querySelector('.display');
        display.textContent = 'overflow!';
        }
    return string;
}

window.addEventListener('load',initCalculator);