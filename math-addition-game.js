// math-addition-game.js
document.addEventListener('DOMContentLoaded', function() {
    const mathContainer = document.querySelector('.math-addition-container');
    if (!mathContainer) return; // Only run if on the math game page

    // --- Get DOM Elements ---
    const settingsDiv = document.getElementById('math-game-settings');
    const roundsSetting = document.getElementById('math-rounds-setting');
    const roundsCustomInput = document.getElementById('math-rounds-custom');
    const startGameBtn = document.getElementById('start-math-game-btn');

    const gameInfoDiv = document.getElementById('math-game-info');
    const scoreDisplay = document.getElementById('math-score-display');
    const roundDisplay = document.getElementById('math-round-display');
    
    const activeGameArea = document.getElementById('math-active-game-area');
    const problemDisplay = document.getElementById('math-problem-display');
    const answerInput = document.getElementById('math-answer-input');
    const checkBtn = document.getElementById('check-math-btn');
    const hintBtn = document.getElementById('math-hint-btn'); // New
    const hintDisplay = document.getElementById('math-hint-display'); // New
    const feedbackDisplay = document.getElementById('math-feedback');

    const gameOverModal = document.getElementById('math-game-over-modal');
    const finalScoreText = document.getElementById('math-final-score-text');
    const playAgainBtn = document.getElementById('math-play-again-btn');
    const backToMenuBtn = document.getElementById('math-back-to-menu-btn');
    const mainBtn = document.getElementById('main-btn');

    // --- Game State Variables ---
    let currentAnswer = 0;
    let num1 = 0; // New: to store first number
    let num2 = 0; // New: to store second number
    let totalRounds = 10;
    let currentRound = 0;
    let score = 0;

    // --- Game Logic Functions ---

    function startMathGame() {
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
            endMathGame();
            return;
        }

        num1 = Math.floor(Math.random() * 10) + 1; // Number from 1 to 10
        num2 = Math.floor(Math.random() * 10) + 1; // Number from 1 to 10
        currentAnswer = num1 + num2;

        problemDisplay.textContent = `${num1} + ${num2} = ?`;
        answerInput.value = '';
        feedbackDisplay.textContent = '';
        answerInput.focus();
        updateScorecard();
        hintDisplay.innerHTML = ''; // Clear previous hint
        hintBtn.disabled = false; // Re-enable hint button
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value);
        if (isNaN(userAnswer)) {
            feedbackDisplay.textContent = "Please enter a number.";
            feedbackDisplay.style.color = "orange";
            return;
        }

        if (userAnswer === currentAnswer) {
            playSuccessSound(); // Assumes global function from script.js
            feedbackDisplay.textContent = "✅ Correct!";
            feedbackDisplay.style.color = "green";
            score++;
            setTimeout(loadNewRound, 1500);
        } else {
            playIncorrectSound(); // Assumes global function from script.js
            feedbackDisplay.textContent = `❌ Incorrect. The answer was ${currentAnswer}.`;
            feedbackDisplay.style.color = "red";
            setTimeout(loadNewRound, 2000);
        }
        updateScorecard();
    }

    function showHint() {
        hintDisplay.innerHTML = ''; // Clear any existing hint

        // Create and add red circles
        for (let i = 0; i < num1; i++) {
            const circle = document.createElement('div');
            circle.className = 'count-circle red-circle';
            hintDisplay.appendChild(circle);
        }
        // Create and add blue circles
        for (let i = 0; i < num2; i++) {
            const circle = document.createElement('div');
            circle.className = 'count-circle blue-circle';
            hintDisplay.appendChild(circle);
        }
        hintBtn.disabled = true; // Disable button after use for this round
    }

    function updateScorecard() {
        scoreDisplay.textContent = `Score: ${score}`;
        roundDisplay.textContent = `Round: ${currentRound} / ${totalRounds}`;
    }

    function endMathGame() {
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
    startGameBtn.addEventListener('click', startMathGame);
    checkBtn.addEventListener('click', checkAnswer);
    hintBtn.addEventListener('click', showHint); // New
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });

    playAgainBtn.addEventListener('click', startMathGame);
    backToMenuBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
    
    mainBtn.addEventListener('click', () => {
        // If game is active, button shows settings. If settings are active, it goes to index.
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
