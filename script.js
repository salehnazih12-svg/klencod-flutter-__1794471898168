
const choices = {
  rock: { emoji: "✊", name: "حجر" },
  paper: { emoji: "✋", name: "ورقة" },
  scissors: { emoji: "✌️", name: "مقص" }
};

const winningMoves = {
  rock: "paper",
  paper: "scissors",
  scissors: "rock"
};

let mode = "ai";
let playerScore = 0;
let computerScore = 0;
let round = 1;
let firstPlayerChoice = null;
let localStep = 1;
let gameOver = false;
let history = [];

const $ = id => document.getElementById(id);

const playerScoreEl = $("playerScore");
const computerScoreEl = $("computerScore");
const roundEl = $("roundNumber");
const leftHand = $("leftHand");
const rightHand = $("rightHand");
const message = $("message");
const hint = $("hint");
const resultText = $("resultText");
const leftName = $("leftName");
const rightName = $("rightName");
const leftLabel = $("leftLabel");
const rightLabel = $("rightLabel");
const choiceButtons = document.querySelectorAll(".choice");

// اختيار وضع اللعب
document.querySelectorAll(".mode").forEach(button => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;

    document.querySelectorAll(".mode").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    resetGame();
  });
});

// اختيار الحجر أو الورقة أو المقص
choiceButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (gameOver) return;

    const selected = button.dataset.choice;

    if (!choices[selected]) return;

    if (mode === "ai") {
      playAgainstAI(selected);
    } else {
      playLocal(selected);
    }
  });
});

// اللعب ضد الذكاء الاصطناعي
function playAgainstAI(playerChoice) {
  const aiChoice = getSmartAIChoice();

  history.push(playerChoice);

  if (history.length > 12) {
    history.shift();
  }

  showHands(playerChoice, aiChoice);

  const result = getWinner(playerChoice, aiChoice);

  finishRound(result);
}

// الذكاء الاصطناعي يتعلم من اختيارات اللاعب السابقة
function getSmartAIChoice() {
  // في البداية يختار بشكل متنوع
  if (history.length < 2) {
    return randomChoice();
  }

  const recent = history.slice(-7);
  const counts = {
    rock: 0,
    paper: 0,
    scissors: 0
  };

  recent.forEach(choice => {
    counts[choice]++;
  });

  // يتوقع أكثر حركة استخدمها اللاعب
  const mostUsed = Object.keys(counts).sort(
    (a, b) => counts[b] - counts[a]
  )[0];

  const total = recent.length;
  const frequency = counts[mostUsed] / total;

  // إذا كان هناك نمط واضح، يحاول مواجهته
  if (frequency >= 0.35 && Math.random() < 0.75) {
    return winningMoves[mostUsed];
  }

  // أحياناً يغير حركته حتى لا يصبح متوقعاً
  return randomChoice();
}

function randomChoice() {
  const all = Object.keys(choices);
  return all[Math.floor(Math.random() * all.length)];
}

// اللعب بلاعبين على نفس الجوال
function playLocal(selected) {
  if (localStep === 1) {
    firstPlayerChoice = selected;
    localStep = 2;

    leftHand.textContent = "🔒";
    rightHand.textContent = "❔";

    leftLabel.textContent = "اللاعب الأول";
    rightLabel.textContent = "اللاعب الثاني";

    message.textContent = "تم حفظ اختيار اللاعب الأول!";
    hint.textContent = "سلّم الجوال للاعب الثاني ليختار بسرية.";

    return;
  }

  const secondChoice = selected;
  const firstChoice = firstPlayerChoice;

  showHands(firstChoice, secondChoice);

  const result = getWinner(firstChoice, secondChoice);

  finishRound(result);

  firstPlayerChoice = null;
  localStep = 1;
}

// مقارنة الاختيارات
function getWinner(first, second) {
  if (first === second) return "draw";

  if (winningMoves[first] === second) {
    return "first";
  }

  return "second";
}

// إظهار الحركات
function showHands(first, second) {
  leftHand.textContent = choices[first].emoji;
  rightHand.textContent = choices[second].emoji;

  leftHand.style.transform = "scale(1.08)";
  rightHand.style.transform = "scale(1.08)";

  setTimeout(() => {
    leftHand.style.transform = "scale(1)";
    rightHand.style.transform = "scale(1)";
  }, 180);
}

// إنهاء الجولة وتحديث النتيجة
function finishRound(result) {
  if (result === "first") {
    playerScore++;
    message.textContent = mode === "ai"
      ? "🎉 فزت بهذه الجولة!"
      : "🏆 فاز اللاعب الأول!";
    resultText.textContent = "نقطة للفائز!";
  } else if (result === "second") {
    computerScore++;
    message.textContent = mode === "ai"
      ? "🤖 الكمبيوتر فاز بهذه الجولة!"
      : "🏆 فاز اللاعب الثاني!";
    resultText.textContent = "نقطة للفائز!";
  } else {
    message.textContent = "🤝 تعادل! لا توجد نقطة.";
    resultText.textContent = "تعادل في هذه الجولة.";
  }

  updateScore();

  if (playerScore >= 5 || computerScore >= 5) {
    gameOver = true;

    if (playerScore > computerScore) {
      message.textContent = mode === "ai"
        ? "🏆 مبروك! أنت بطل اللعبة!"
        : "🏆 اللاعب الأول فاز بالمباراة!";
    } else {
      message.textContent = mode === "ai"
        ? "🤖 الكمبيوتر فاز بالمباراة!"
        : "🏆 اللاعب الثاني فاز بالمباراة!";
    }

    resultText.textContent = "انتهت المباراة! اضغط إعادة اللعب.";
    hint.textContent = "يمكنك بدء مباراة جديدة في أي وقت.";
    return;
  }

  round++;
  roundEl.textContent = round;

  hint.textContent = "اختر حركتك للجولة التالية.";
}

// تحديث لوحة النقاط
function updateScore() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

// إعادة اللعبة
function resetGame() {
  playerScore = 0;
  computerScore = 0;
  round = 1;
  firstPlayerChoice = null;
  localStep = 1;
  gameOver = false;
  history = [];

  updateScore();
  roundEl.textContent = round;

  leftHand.textContent = "❔";
  rightHand.textContent = "❔";

  if (mode === "ai") {
    leftName.textContent = "أنت";
    rightName.textContent = "الكمبيوتر";
    leftLabel.textContent = "أنت";
    rightLabel.textContent = "الكمبيوتر";
    message.textContent = "هل تستطيع الفوز على الذكاء الاصطناعي؟";
    hint.textContent = "اختر الحجر أو الورقة أو المقص.";
  } else {
    leftName.textContent = "اللاعب الأول";
    rightName.textContent = "اللاعب الثاني";
    leftLabel.textContent = "اللاعب الأول";
    rightLabel.textContent = "اللاعب الثاني";
    message.textContent = "تحدَّ صديقك على نفس الجوال!";
    hint.textContent = "اللاعب الأول يبدأ بالاختيار.";
  }

  resultText.textContent = "ابدأ اللعب!";
}

$("resetBtn").addEventListener("click", resetGame);

// تشغيل اللعبة
resetGame();