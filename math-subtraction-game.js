// math-subtraction-game.js
document.addEventListener('DOMContentLoaded', function() {
    const subtractionContainer = document.querySelector('.math-subtraction-container');
    if (!subtractionContainer) return; // Only run on this game's page

    // --- Get DOM Elements ---
    const settingsDiv = document.getElementById('subtraction-game-settings');
    const roundsSetting = document.getElementById('subtraction-rounds-setting');
    const roundsCustomInput = document.getElementById('subtraction-rounds-custom');
    const startGameBtn = document.getElementById('start-subtraction-game-btn');

    const gameInfoDiv = document.getElementById('subtraction-game-info');
    const scoreDisplay = document.getElementById('subtraction-score-display');
    const roundDisplay = document.getElementById('subtraction-round-display');
    
    const activeGameArea = document.getElementById('subtraction-active-game-area');
    const problemDisplay = document.getElementById('subtraction-problem-display');
    const answerInput = document.getElementById('subtraction-answer-input');
    const checkBtn = document.getElementById('check-subtraction-btn');
    const hintBtn = document.getElementById('subtraction-hint-btn');
    const hintDisplay = document.getElementById('subtraction-hint-display');
    const feedbackDisplay = document.getElementById('subtraction-feedback');

    const gameOverModal = document.getElementById('subtraction-game-over-modal');
    const finalScoreText = document.getElementById('subtraction-final-score-text');
    const playAgainBtn = document.getElementById('subtraction-play-again-btn');
    const backToMenuBtn = document.getElementById('subtraction-back-to-menu-btn');
    const mainBtn = document.getElementById('main-btn');

    // --- Game State Variables ---
    let currentAnswer = 0;
    let num1 = 0;
    let num2 = 0;
    let totalRounds = 10;
    let currentRound = 0;
    let score = 0;

    // --- Game Logic Functions ---

    function startSubtractionGame() {
        if (roundsSetting.value === 'custom') {
            const customRounds = parseInt(roundsCustomInput.value);
            totalRounds = (customRounds > 0 && customRounds <= 100) ? customRounds : 10;
        } else {
            totalRounds = parseInt(roundsSetting.value);
        }

        currentRound = 0;
        score = 0;

        settingsDiv.classList.add('hidden');
        gameOverModal.classList.add('hidden');
        gameInfoDiv.classList.remove('hidden');
        activeGameArea.classList.remove('hidden');
        mainBtn.textContent = 'End Game & Return to Settings';

        loadNewRound();
    }

    function loadNewRound() {
        currentRound++;
        if (currentRound > totalRounds) {
            endSubtractionGame();
            return;
        }

        num1 = Math.floor(Math.random() * 10) + 1; // 1 to 10
        num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1, ensures positive result
        currentAnswer = num1 - num2;

        problemDisplay.textContent = `${num1} - ${num2} = ?`;
        answerInput.value = '';
        feedbackDisplay.textContent = '';
        answerInput.focus();
        updateScorecard();
        hintDisplay.innerHTML = '';
        hintBtn.disabled = false;
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value);
        if (isNaN(userAnswer)) {
            feedbackDisplay.textContent = "Please enter a number.";
            feedbackDisplay.style.color = "orange";
            return;
        }

        if (userAnswer === currentAnswer) {
            playSuccessSound();
            feedbackDisplay.textContent = "✅ Correct!";
            feedbackDisplay.style.color = "green";
            score++;
            setTimeout(loadNewRound, 1500);
        } else {
            playIncorrectSound();
            feedbackDisplay.textContent = `❌ Incorrect. The answer was ${currentAnswer}.`;
            feedbackDisplay.style.color = "red";
            setTimeout(loadNewRound, 2000);
        }
        updateScorecard();
    }

    function showHint() {
        hintDisplay.innerHTML = '';
        const circles = [];

        for (let i = 0; i < num1; i++) {
            const circle = document.createElement('div');
            circle.className = 'count-circle blue-circle';
            hintDisplay.appendChild(circle);
            circles.push(circle);
        }

        for (let i = 0; i < num2; i++) {
            circles[i].classList.add('crossed-out');
        }
        hintBtn.disabled = true;
    }

    function updateScorecard() {
        scoreDisplay.textContent = `Score: ${score}`;
        roundDisplay.textContent = `Round: ${currentRound} / ${totalRounds}`;
    }

    function endSubtractionGame() {
        finalScoreText.textContent = `You scored ${score} out of ${totalRounds} correctly!`;
        gameOverModal.classList.remove('hidden');
        activeGameArea.classList.add('hidden');
        gameInfoDiv.classList.add('hidden');
        mainBtn.textContent = 'Back to Main Menu';
    }

    function showSettings() {
        settingsDiv.classList.remove('hidden');
        gameOverModal.classList.add('hidden');
        gameInfoDiv.classList.add('hidden');
        activeGameArea.classList.add('hidden');
        mainBtn.textContent = 'Back to Main Menu';
    }

    // --- Event Listeners ---
    startGameBtn.addEventListener('click', startSubtractionGame);
    checkBtn.addEventListener('click', checkAnswer);
    hintBtn.addEventListener('click', showHint);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });

    playAgainBtn.addEventListener('click', startSubtractionGame);
    backToMenuBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
    
    mainBtn.addEventListener('click', () => {
        const isGameActive = !activeGameArea.classList.contains('hidden');
        if (isGameActive) {
            showSettings();
        } else {
            window.location.href = 'index.html';
        }
    });

    roundsSetting.addEventListener('change', function() {
        roundsCustomInput.classList.toggle('hidden', this.value !== 'custom');
        if (this.value === 'custom') roundsCustomInput.focus();
    });
});
