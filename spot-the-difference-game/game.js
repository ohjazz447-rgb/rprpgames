// =====================================================
// วิธีแก้ข้อมูลเกม
// 1) เปลี่ยนชื่อด่านที่ title
// 2) เปลี่ยน path รูปภาพที่ leftImage และ rightImage
// 3) แก้เวลาเล่นที่ timeLimit
// 4) แก้จุดจับผิดภาพที่ differences
//    x และ y ใช้หน่วยเป็นเปอร์เซ็นต์ของภาพ
//    radius คือระยะคลิกที่ยอมรับได้ ยิ่งมากยิ่งง่าย
// =====================================================

const levels = [
  {
    title: "ด่านที่ 1 : สวนดอกไม้",
    leftImage: "assets/level1-left.svg",
    rightImage: "assets/level1-right.svg",
    timeLimit: 60,
    differences: [
      { x: 25, y: 43, radius: 6 },
      { x: 51, y: 33, radius: 6 },
      { x: 74, y: 61, radius: 6 }
    ]
  },
  {
    title: "ด่านที่ 2 : อาคารและสวน",
    leftImage: "assets/level2-left.svg",
    rightImage: "assets/level2-right.svg",
    timeLimit: 75,
    differences: [
      { x: 21, y: 38, radius: 6 },
      { x: 46, y: 53, radius: 6 },
      { x: 69, y: 35, radius: 6 },
      { x: 83, y: 68, radius: 6 }
    ]
  }
];

let currentLevelIndex = 0;
let foundItems = [];
let timeLeft = 0;
let timerInterval = null;
let gameEnded = false;

const levelTitle = document.getElementById("levelTitle");
const levelNumber = document.getElementById("levelNumber");
const foundCount = document.getElementById("foundCount");
const totalCount = document.getElementById("totalCount");
const timer = document.getElementById("timer");

const leftImage = document.getElementById("leftImage");
const rightImage = document.getElementById("rightImage");
const leftBox = document.getElementById("leftBox");
const rightBox = document.getElementById("rightBox");
const leftMarkers = document.getElementById("leftMarkers");
const rightMarkers = document.getElementById("rightMarkers");

const restartBtn = document.getElementById("restartBtn");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const nextBtn = document.getElementById("nextBtn");
const messageBox = document.getElementById("messageBox");

function loadLevel(index) {
  const level = levels[index];

  currentLevelIndex = index;
  foundItems = [];
  gameEnded = false;

  levelTitle.textContent = level.title;
  levelNumber.textContent = index + 1;
  foundCount.textContent = 0;
  totalCount.textContent = level.differences.length;

  leftImage.src = level.leftImage;
  rightImage.src = level.rightImage;

  leftMarkers.innerHTML = "";
  rightMarkers.innerHTML = "";

  nextBtn.disabled = true;
  showAnswerBtn.disabled = false;

  messageBox.textContent = "กดที่ตำแหน่งแตกต่างบนภาพใดก็ได้";

  startTimer(level.timeLimit);
}

function startTimer(seconds) {
  clearInterval(timerInterval);

  timeLeft = seconds;
  timer.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

function handleImageClick(event) {
  if (gameEnded) return;

  const level = levels[currentLevelIndex];
  const box = event.currentTarget;
  const rect = box.getBoundingClientRect();

  const clickX = ((event.clientX - rect.left) / rect.width) * 100;
  const clickY = ((event.clientY - rect.top) / rect.height) * 100;

  if (isDebugMode()) {
    console.log(`ตำแหน่งที่คลิก: { x: ${clickX.toFixed(1)}, y: ${clickY.toFixed(1)}, radius: 6 }`);
    messageBox.textContent = `ตำแหน่งที่คลิก: x=${clickX.toFixed(1)}, y=${clickY.toFixed(1)}`;
  }

  const foundIndex = level.differences.findIndex((diff, index) => {
    if (foundItems.includes(index)) return false;

    const distance = Math.sqrt(
      Math.pow(clickX - diff.x, 2) + Math.pow(clickY - diff.y, 2)
    );

    return distance <= diff.radius;
  });

  if (foundIndex !== -1) {
    foundItems.push(foundIndex);

    const diff = level.differences[foundIndex];
    addMarker(leftMarkers, diff.x, diff.y);
    addMarker(rightMarkers, diff.x, diff.y);

    foundCount.textContent = foundItems.length;
    messageBox.textContent = "พบจุดแตกต่างแล้ว";

    if (foundItems.length === level.differences.length) {
      endGame(true);
    }
  } else if (!isDebugMode()) {
    messageBox.textContent = "ยังไม่ใช่จุดที่แตกต่าง ลองใหม่อีกครั้ง";
  }
}

function addMarker(layer, x, y) {
  const marker = document.createElement("div");
  marker.className = "marker";
  marker.style.left = `${x}%`;
  marker.style.top = `${y}%`;
  layer.appendChild(marker);
}

function endGame(success) {
  clearInterval(timerInterval);
  gameEnded = true;
  showAnswerBtn.disabled = true;

  if (success) {
    messageBox.textContent = "ยินดีด้วย พบจุดแตกต่างครบแล้ว";
    nextBtn.disabled = currentLevelIndex >= levels.length - 1;
  } else {
    messageBox.textContent = "หมดเวลา กดเริ่มใหม่เพื่อลองอีกครั้ง หรือกดเฉลยเพื่อดูคำตอบ";
    showAnswerBtn.disabled = false;
  }
}

function restartGame() {
  loadLevel(currentLevelIndex);
}

function nextLevel() {
  if (currentLevelIndex < levels.length - 1) {
    loadLevel(currentLevelIndex + 1);
  }
}

function showAnswer() {
  const level = levels[currentLevelIndex];

  clearInterval(timerInterval);
  gameEnded = true;
  foundItems = level.differences.map((_, index) => index);
  foundCount.textContent = foundItems.length;

  leftMarkers.innerHTML = "";
  rightMarkers.innerHTML = "";

  level.differences.forEach((diff) => {
    addMarker(leftMarkers, diff.x, diff.y);
    addMarker(rightMarkers, diff.x, diff.y);
  });

  messageBox.textContent = "แสดงเฉลยแล้ว";
  showAnswerBtn.disabled = true;
  nextBtn.disabled = currentLevelIndex >= levels.length - 1;
}

function isDebugMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("debug") === "1";
}

leftBox.addEventListener("click", handleImageClick);
rightBox.addEventListener("click", handleImageClick);
restartBtn.addEventListener("click", restartGame);
showAnswerBtn.addEventListener("click", showAnswer);
nextBtn.addEventListener("click", nextLevel);

loadLevel(0);
