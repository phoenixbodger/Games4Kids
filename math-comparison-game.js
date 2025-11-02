// math-comparison-game.js
document.addEventListener('DOMContentLoaded', function() {
    const comparisonContainer = document.querySelector('.math-comparison-container');
    if (!comparisonContainer) return; // Only run on the comparison game page

    // --- Get DOM Elements ---
    const settingsDiv = document.getElementById('comparison-game-settings');
    const roundsSetting = document.getElementById('comparison-rounds-setting');
    const roundsCustomInput = document.getElementById('comparison-rounds-custom');
    const startGameBtn = document.getElementById('start-comparison-game-btn');

    const gameInfoDiv = document.getElementById('comparison-game-info');
    const scoreDisplay = document.getElementById('comparison-score-display');
    const roundDisplay = document.getElementById('comparison-round-display');
    
    const activeGameArea = document.getElementById('comparison-active-game-area');
    const num1Display = document.getElementById('comparison-num1');
    const num2Display = document.getElementById('comparison-num2');
    const choiceButtons = document.querySelectorAll('.comparison-choices .choice-button');
    const feedbackDisplay = document.getElementById('comparison-feedback');

    const gameOverModal = document.getElementById('comparison-game-over-modal');
    const finalScoreText = document.getElementById('comparison-final-score-text');
    const playAgainBtn = document.getElementById('comparison-play-again-btn');
    const backToMenuBtn = document.getElementById('comparison-back-to-menu-btn');
    const mainBtn = document.getElementById('main-btn');

    // --- Game State Variables ---
    let correctAnswer = '';
    let totalRounds = 10;
    let currentRound = 0;
    let score = 0;

    // --- Game Logic Functions ---

    function startComparisonGame() {
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
            endComparisonGame();
            return;
        }

        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;

        num1Display.textContent = num1;
        num2Display.textContent = num2;

        if (num1 > num2) {
            correctAnswer = '>';
        } else if (num1 < num2) {
            correctAnswer = '<';
        } else {
            correctAnswer = '=';
        }

        feedbackDisplay.textContent = '';
        updateScorecard();
    }

    function checkAnswer(playerChoice) {
        if (playerChoice === correctAnswer) {
            playSuccessSound();
            feedbackDisplay.textContent = "✅ Correct!";
            feedbackDisplay.style.color = "green";
            score++;
            setTimeout(loadNewRound, 1500);
        } else {
            playIncorrectSound();
            feedbackDisplay.textContent = `❌ Incorrect. The correct answer was ${correctAnswer}.`;
            feedbackDisplay.style.color = "red";
            setTimeout(loadNewRound, 2000);
        }
        updateScorecard();
    }

    function updateScorecard() {
        scoreDisplay.textContent = `Score: ${score}`;
        roundDisplay.textContent = `Round: ${currentRound} / ${totalRounds}`;
    }

    function endComparisonGame() {
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
    startGameBtn.addEventListener('click', startComparisonGame);
    
    choiceButtons.forEach(button => {
        button.addEventListener('click', () => checkAnswer(button.dataset.choice));
    });

    playAgainBtn.addEventListener('click', startComparisonGame);
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
