let display = document.getElementById('display');

function appendValue(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = '';
}

function calculate() {
  try {
    let result = eval(display.value);
    display.value = result;
  } catch (error) {
    display.value = 'Error';
  }
}

function appendValue(value) {
  display.value += value;
  animateDisplay();
}

function animateDisplay() {
  display.classList.add('updated');
  setTimeout(() => display.classList.remove('updated'), 150);
}