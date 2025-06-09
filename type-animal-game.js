// type-animal-game.js
document.addEventListener('DOMContentLoaded', function() {
    const animalInput = document.getElementById('animal-input');
    if (animalInput) { // Check if we are on the animal game page
        const animalImg = document.getElementById('animal-img');
        const checkBtn = document.getElementById('check-btn');
        const hintBtn = document.getElementById('hint-btn');
        const hintDisplay = document.getElementById('hint-display');
        const messageDisplay = document.getElementById('message');

        // New elements for score/rounds
        const animalRoundsSetting = document.getElementById('animal-rounds-setting');
        const animalRoundsCustomInput = document.getElementById('animal-rounds-custom');
        const startAnimalGameBtn = document.getElementById('start-animal-game-btn');
        const animalGameInfo = document.getElementById('animal-game-info');
        const animalRoundDisplay = document.getElementById('animal-round-display');
        const animalScoreDisplay = document.getElementById('animal-score-display');
        const animalGameArea = document.getElementById('animal-game-area'); // .animal-display
        const animalInputControls = document.getElementById('animal-input-controls'); // .input-area

        // New elements for Animal Game Timer
        const animalTimerSetting = document.getElementById('animal-timer-setting');
        const animalTimerCustomInput = document.getElementById('animal-timer-custom');
        const animalTimerDisplay = document.getElementById('animal-timer-display');

        // Game Over Modal elements
        const gameOverModal = document.getElementById('game-over-modal');
        const finalScoreText = document.getElementById('final-score-text');
        const playAgainBtn = document.getElementById('play-again-btn');
        const backToMenuBtn = document.getElementById('back-to-menu-btn');

        let animalTimerInterval;
        let animalTimeLeft;
        let animals = [];
        let currentAnimalName = '';
        let totalAnimalRounds = '5'; // Default to 5
        let currentAnimalRound = 0;
        let correctAnimalAnswers = 0;
        let animalIncorrectAttempts = 0;

        // Function to reset and start a new animal game
        function startAnimalGame() {
            if (animalRoundsSetting.value === 'custom') {
                const customRounds = parseInt(animalRoundsCustomInput.value);
                totalAnimalRounds = (customRounds > 0) ? customRounds.toString() : '5'; // Default to 5 if invalid
            } else {
                totalAnimalRounds = animalRoundsSetting.value;
            }

            currentAnimalRound = 0;
            correctAnimalAnswers = 0;

            document.querySelector('.game-settings').classList.add('hidden');
            animalGameInfo.classList.remove('hidden');
            animalGameArea.classList.remove('hidden');
            animalInputControls.classList.remove('hidden');
            gameOverModal.classList.add('hidden');

            updateAnimalScorecard();
            loadNewAnimalRound();
        }

        async function loadNewAnimalRound() {
            currentAnimalRound++;
            stopAnimalTimer();
            animalIncorrectAttempts = 0;

            if (currentAnimalRound > parseInt(totalAnimalRounds)) {
                endAnimalGame();
                return;
            }

            const allWords = await loadWords(); // Assumes loadWords is global (from script.js)
            if (allWords.length === 0) {
                messageDisplay.textContent = "Error: No words loaded for animals!";
                return;
            }
            animals = allWords;
            currentAnimalName = animals[Math.floor(Math.random() * animals.length)].toLowerCase();

            if (animalImg) {
                animalImg.src = `images/${currentAnimalName}.png`;
            } else {
                console.warn("Animal image element not found on type-animal-game.html.");
            }
            animalInput.value = '';
            hintDisplay.textContent = '';
            messageDisplay.textContent = '';
            hintBtn.style.display = 'inline-block';

            updateAnimalScorecard();
            startAnimalTimer();
            animalInput.focus();
        }

        function typeAnimalCheckAnswer() {
            const userAnswer = animalInput.value.trim().toLowerCase();
            if (userAnswer === currentAnimalName) {
                stopAnimalTimer();
                playSuccessSound(); // Assumes playSuccessSound is global
                messageDisplay.textContent = "Correct! Well done!";
                messageDisplay.style.color = "green";
                correctAnimalAnswers++;
                updateAnimalScorecard();
                setTimeout(loadNewAnimalRound, 1500);
            } else {
                animalIncorrectAttempts++;
                playIncorrectSound(); // Assumes playIncorrectSound is global
                if (animalIncorrectAttempts >= 2) {
                    messageDisplay.textContent = `❌ Incorrect. The animal was "${currentAnimalName}".`;
                    messageDisplay.style.color = "red";
                    updateAnimalScorecard();
                    setTimeout(loadNewAnimalRound, 2000);
                } else {
                    messageDisplay.textContent = "❌ TRY AGAIN! (1 attempt left)";
                    messageDisplay.style.color = "red";
                }
            }
        }

        function showAnimalHint() {
            const hintLength = Math.ceil(currentAnimalName.length / 2);
            hintDisplay.textContent = `Hint: Starts with "${currentAnimalName.substring(0, hintLength)}"`;
            hintBtn.style.display = 'none';
        }

        function updateAnimalScorecard() {
            animalScoreDisplay.textContent = `Score: ${correctAnimalAnswers}`;
            animalRoundDisplay.textContent = `Round: ${currentAnimalRound} / ${totalAnimalRounds}`;
        }

        function endAnimalGame() {
            stopAnimalTimer();
            gameOverModal.classList.remove('hidden');
            animalGameArea.classList.add('hidden');
            animalInputControls.classList.add('hidden');
            animalGameInfo.classList.add('hidden');
            messageDisplay.textContent = "";
            hintDisplay.textContent = "";
            finalScoreText.textContent = `You answered ${correctAnimalAnswers} out of ${totalAnimalRounds} correctly!`;
        }

        function startAnimalTimer() {
            stopAnimalTimer();
            let timerDurationValue = animalTimerSetting.value;
            let actualDurationSeconds;

            if (timerDurationValue === 'custom') {
                const customSeconds = parseInt(animalTimerCustomInput.value);
                actualDurationSeconds = (customSeconds > 0) ? customSeconds : 0;
            } else if (timerDurationValue === 'off') {
                actualDurationSeconds = 0;
            } else {
                actualDurationSeconds = parseInt(timerDurationValue);
            }

            if (actualDurationSeconds <= 0) {
                animalTimerDisplay.textContent = 'Time: Off';
                return;
            }
            animalTimeLeft = actualDurationSeconds;
            animalTimerDisplay.textContent = `Time: ${animalTimeLeft}s`;

            animalTimerInterval = setInterval(() => {
                animalTimeLeft--;
                animalTimerDisplay.textContent = `Time: ${animalTimeLeft}s`;
                if (animalTimeLeft <= 0) {
                    handleAnimalTimeUp();
                }
            }, 1000);
        }

        function stopAnimalTimer() {
            clearInterval(animalTimerInterval);
            animalTimerInterval = null;
        }

        function handleAnimalTimeUp() {
            stopAnimalTimer();
            playIncorrectSound(); // Assumes playIncorrectSound is global
            messageDisplay.textContent = `⏰ Time's up! The animal was "${currentAnimalName}".`;
            messageDisplay.style.color = "orange";
            setTimeout(loadNewAnimalRound, 2000);
        }

        startAnimalGameBtn.addEventListener('click', startAnimalGame);
        checkBtn.addEventListener('click', typeAnimalCheckAnswer);
        hintBtn.addEventListener('click', showAnimalHint);
        animalInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') typeAnimalCheckAnswer();
        });

        playAgainBtn.addEventListener('click', startAnimalGame);
        backToMenuBtn.addEventListener('click', () => { window.location.href = 'index.html'; });

        animalRoundsSetting.addEventListener('change', function() {
            animalRoundsCustomInput.classList.toggle('hidden', this.value !== 'custom');
            if (this.value === 'custom') animalRoundsCustomInput.focus();
        });

        animalTimerSetting.addEventListener('change', function() {
            animalTimerCustomInput.classList.toggle('hidden', this.value !== 'custom');
            if (this.value === 'custom') animalTimerCustomInput.focus();
        });

        document.querySelector('.game-settings').classList.remove('hidden');
        animalGameInfo.classList.add('hidden');
        animalGameArea.classList.add('hidden');
        animalInputControls.classList.add('hidden');
        gameOverModal.classList.add('hidden');
    }
});