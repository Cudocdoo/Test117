// ===== 1. 계산기의 "기억(상태)" =====
// 계산기는 지금 화면의 숫자, 앞에서 입력한 숫자, 고른 연산자를 기억해야 해요.
let current = "0";        // 지금 입력 중인 숫자 (문자열로 저장해야 "0." 같은 입력이 가능)
let previous = null;      // 연산자를 누르기 전에 입력했던 숫자
let operator = null;      // 선택한 연산자: "+", "-", "*", "/"
let resetNext = false;    // true면 다음 숫자 입력 시 화면을 새로 시작

const currentEl = document.getElementById("current");
const expressionEl = document.getElementById("expression");

// 화면에 보여줄 연산자 기호
const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// ===== 2. 실제 계산 =====
function calculate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? null : a / b; // 0으로 나누면 null(오류)
  }
}

// 0.1 + 0.2 = 0.30000000000000004 같은 소수점 오차를 보기 좋게 정리
function format(num) {
  return String(parseFloat(num.toPrecision(12)));
}

// ===== 3. 버튼 동작 =====
// "=" 결과가 나온 뒤 새 숫자를 치면, 위쪽에 남은 이전 계산식을 지움
function startFresh() {
  if (resetNext && operator === null) expressionEl.textContent = "";
}

function inputNumber(n) {
  startFresh();
  if (resetNext || current === "0") {
    current = n;
    resetNext = false;
  } else if (current.length < 15) {
    current += n;
  }
}

function inputDot() {
  startFresh();
  if (resetNext) {
    current = "0";
    resetNext = false;
  }
  if (!current.includes(".")) current += ".";
}

function chooseOperator(op) {
  // 이미 "3 +" 상태에서 숫자를 입력했다면 먼저 계산 (예: 3 + 4 × → 7 ×)
  if (operator && !resetNext) equals();
  if (current === "오류") return;
  previous = parseFloat(current);
  operator = op;
  resetNext = true;
}

function equals() {
  if (operator === null || previous === null) return;
  const b = parseFloat(current);
  const result = calculate(previous, b, operator);

  expressionEl.textContent = `${format(previous)} ${symbols[operator]} ${format(b)} =`;
  current = result === null ? "오류" : format(result);
  previous = null;
  operator = null;
  resetNext = true;
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  resetNext = false;
  expressionEl.textContent = "";
}

function deleteLast() {
  if (resetNext) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
}

function percent() {
  current = format(parseFloat(current) / 100);
}

// ===== 4. 화면 갱신 =====
function updateDisplay() {
  currentEl.textContent = current;
  if (operator) {
    expressionEl.textContent = `${format(previous)} ${symbols[operator]}`;
  }
}

// ===== 5. 이벤트 연결 =====
// 버튼마다 따로 연결하지 않고, 부모(.buttons) 하나에서 클릭을 받아 처리 (이벤트 위임)
document.querySelector(".buttons").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  // "오류" 상태에서는 숫자/AC만 새로 시작하도록 초기화
  if (current === "오류" && !btn.dataset.number && btn.dataset.action !== "clear") return;
  if (current === "오류") clearAll();

  if (btn.dataset.number) inputNumber(btn.dataset.number);
  else if (btn.dataset.operator) chooseOperator(btn.dataset.operator);
  else if (btn.dataset.action === "dot") inputDot();
  else if (btn.dataset.action === "equals") equals();
  else if (btn.dataset.action === "clear") clearAll();
  else if (btn.dataset.action === "delete") deleteLast();
  else if (btn.dataset.action === "percent") percent();

  updateDisplay();
});

// 키보드로도 입력할 수 있게: 키 → 해당 버튼을 클릭한 것처럼 처리
document.addEventListener("keydown", (e) => {
  const keyMap = {
    Enter: '[data-action="equals"]',
    "=": '[data-action="equals"]',
    Escape: '[data-action="clear"]',
    Backspace: '[data-action="delete"]',
    ".": '[data-action="dot"]',
    "%": '[data-action="percent"]',
  };
  let selector = keyMap[e.key];
  if (/^[0-9]$/.test(e.key)) selector = `[data-number="${e.key}"]`;
  if ("+-*/".includes(e.key) && e.key.length === 1) selector = `[data-operator="${e.key}"]`;

  if (selector) {
    e.preventDefault();
    document.querySelector(selector).click();
  }
});
