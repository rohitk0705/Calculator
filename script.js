const display = document.getElementById('display');
const statusMessage = document.getElementById('status');
const historyList = document.getElementById('history-list');
const keypad = document.querySelector('.buttons');
const clearHistoryButton = document.querySelector('[data-action="clear-history"]');
const historyLimit = 8;
let historyEntries = [];

const allowedKeys = /[0-9+\-*/().]/;

const formatResult = (value) => {
  if (!Number.isFinite(value)) {
    return 'Error';
  }
  return Number.isInteger(value) ? value.toString() : parseFloat(value.toFixed(8)).toString();
};

const setStatus = (message = '', isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#fca5a5' : '#94a3b8';
};

const animateDisplay = () => {
  display.classList.add('updated');
  setTimeout(() => display.classList.remove('updated'), 180);
};

const appendValue = (value) => {
  if (display.value === 'Error') {
    display.value = '';
  }
  display.value += value;
  animateDisplay();
  setStatus();
};

const clearDisplay = () => {
  display.value = '';
  setStatus('Cleared');
};

const deleteLast = () => {
  if (!display.value || display.value === 'Error') {
    display.value = '';
    return;
  }
  display.value = display.value.slice(0, -1);
};

const sanitizeExpression = (expression) => {
  return expression.replace(/[^0-9+\-*/().]/g, '');
};

const evaluateExpression = (expression) => {
  const sanitized = sanitizeExpression(expression);
  if (!sanitized.trim()) {
    return '';
  }
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${sanitized})`)();
};

const addHistoryEntry = (expression, result) => {
  if (!expression.trim()) {
    return;
  }
  historyEntries = [{ expression, result }, ...historyEntries].slice(0, historyLimit);
  renderHistory();
};

const clearHistory = () => {
  historyEntries = [];
  renderHistory();
  setStatus('History cleared');
};

const renderHistory = () => {
  historyList.innerHTML = '';
  historyEntries.forEach(({ expression, result }) => {
    const item = document.createElement('li');
    const expressionSpan = document.createElement('span');
    const resultStrong = document.createElement('strong');

    expressionSpan.textContent = expression;
    resultStrong.textContent = result;

    item.dataset.expression = expression;
    item.dataset.result = result;
    item.appendChild(expressionSpan);
    item.appendChild(resultStrong);
    historyList.appendChild(item);
  });
};

const calculate = () => {
  try {
    const value = evaluateExpression(display.value);
    if (value === '') {
      return;
    }
    const result = formatResult(value);
    if (result === 'Error') {
      throw new Error('Invalid calculation');
    }
    addHistoryEntry(display.value, result);
    display.value = result;
    animateDisplay();
    setStatus('Result added to history');
  } catch (error) {
    display.value = 'Error';
    setStatus('Please check the expression', true);
  }
};

const applySquare = () => {
  if (!display.value.trim()) {
    return;
  }
  try {
    const value = evaluateExpression(display.value);
    const squared = formatResult(Math.pow(Number(value), 2));
    addHistoryEntry(`${display.value}²`, squared);
    display.value = squared;
    animateDisplay();
  } catch (error) {
    display.value = 'Error';
    setStatus('Unable to square this value', true);
  }
};

const applySqrt = () => {
  if (!display.value.trim()) {
    return;
  }
  try {
    const value = evaluateExpression(display.value);
    if (value < 0) {
      throw new Error('Negative square root');
    }
    const rooted = formatResult(Math.sqrt(Number(value)));
    addHistoryEntry(`√(${display.value})`, rooted);
    display.value = rooted;
    animateDisplay();
  } catch (error) {
    display.value = 'Error';
    setStatus('Cannot take square root', true);
  }
};

const toggleSign = () => {
  if (!display.value.trim()) {
    return;
  }
  try {
    const value = evaluateExpression(display.value);
    const toggled = formatResult(Number(value) * -1);
    display.value = toggled;
    animateDisplay();
  } catch (error) {
    display.value = 'Error';
    setStatus('Unable to toggle sign', true);
  }
};

const handleAction = (action) => {
  switch (action) {
    case 'clear':
      clearDisplay();
      break;
    case 'delete':
      deleteLast();
      break;
    case 'equals':
      calculate();
      break;
    case 'square':
      applySquare();
      break;
    case 'sqrt':
      applySqrt();
      break;
    case 'toggle-sign':
      toggleSign();
      break;
    case 'clear-history':
      clearHistory();
      break;
    default:
      break;
  }
};

const handleButtonClick = (event) => {
  const target = event.target.closest('button');
  if (!target) {
    return;
  }

  const { value, action } = target.dataset;
  if (value) {
    appendValue(value);
  } else if (action) {
    handleAction(action);
  }
};

const handleKeyboardInput = (event) => {
  const { key } = event;

  if (allowedKeys.test(key)) {
    event.preventDefault();
    appendValue(key);
    return;
  }

  switch (key) {
    case 'Enter':
    case '=':
      event.preventDefault();
      calculate();
      break;
    case 'Backspace':
      event.preventDefault();
      deleteLast();
      break;
    case 'Delete':
    case 'Escape':
      event.preventDefault();
      clearDisplay();
      break;
    case 's':
      event.preventDefault();
      applySquare();
      break;
    case 'r':
      event.preventDefault();
      applySqrt();
      break;
    case 't':
      event.preventDefault();
      toggleSign();
      break;
    default:
      break;
  }
};

keypad.addEventListener('click', handleButtonClick);
document.addEventListener('keydown', handleKeyboardInput);

if (clearHistoryButton) {
  clearHistoryButton.addEventListener('click', () => handleAction('clear-history'));
}

historyList.addEventListener('click', (event) => {
  const entry = event.target.closest('li');
  if (!entry) {
    return;
  }
  display.value = entry.dataset.result || '';
  setStatus('Loaded value from history');
  animateDisplay();
});

renderHistory();
setStatus('Ready');