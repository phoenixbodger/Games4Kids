// word-match-game.js
document.addEventListener('DOMContentLoaded', function() {
    const wordMatchContainer = document.querySelector('.word-match-container');
    if (wordMatchContainer) {
        const wordChoicesContainer = wordMatchContainer.querySelector('.words');
        const imageElement = wordMatchContainer.querySelector('.image');
        const feedbackElement = document.getElementById('feedback');

        // Settings elements
        const wmRoundsSetting = document.getElementById('wm-rounds-setting');
        const wmRoundsCustomInput = document.getElementById('wm-rounds-custom');
        const wmTimerSetting = document.getElementById('wm-timer-setting');
        const wmTimerCustomInput = document.getElementById('wm-timer-custom');
        const startWmGameBtn = document.getElementById('start-wm-game-btn');
        const wmGameSettingsDiv = document.getElementById('wm-game-settings');

        // Game info display elements
        const wmGameInfo = document.getElementById('wm-game-info');
        const wmRoundDisplay = document.getElementById('wm-round-display');
        const wmScoreDisplay = document.getElementById('wm-score-display');
        const wmTimerDisplay = document.getElementById('wm-timer-display');

        // Active game area wrapper
        const wmActiveGameArea = document.getElementById('wm-active-game-area');

        // Game Over Modal elements
        const wmGameOverModal = document.getElementById('wm-game-over-modal');
        const wmFinalScoreText = document.getElementById('wm-final-score-text');
        const wmPlayAgainBtn = document.getElementById('wm-play-again-btn');
        const wmBackToMenuBtn = document.getElementById('wm-back-to-menu-btn');

        // Game state variables
        let wmCorrectWord = '';
        let wmTotalRounds = '5';
        let wmCurrentRound = 0;
        let wmCorrectAnswers = 0;
        let wmTimerInterval;
        let wmTimeLeft;
        let wmWordsList = [];
        let wmIncorrectAttempts = 0; // New: Track incorrect attempts for Word Match

        async function preloadWmWords() {
            if (wmWordsList.length === 0) {
                wmWordsList = await loadWords(); // Assumes loadWords is global (from script.js)
            }
        }

        function startWordMatchGame() {
            if (wmRoundsSetting.value === 'custom') {
                const customRounds = parseInt(wmRoundsCustomInput.value);
                wmTotalRounds = (customRounds > 0 && customRounds <= 100) ? customRounds.toString() : '5'; // Max 100 rounds
            } else {
                wmTotalRounds = wmRoundsSetting.value;
            }

            wmCurrentRound = 0;
            wmCorrectAnswers = 0;

            wmGameSettingsDiv.classList.add('hidden');
            wmGameInfo.classList.remove('hidden');
            wmActiveGameArea.classList.remove('hidden');
            wmGameOverModal.classList.add('hidden');

            updateWmScorecard();
            loadNewWordRound();
        }

        async function loadNewWordRound() {
            wmCurrentRound++;
            stopWmTimer();
            wmIncorrectAttempts = 0; // Reset incorrect attempts for the new round

            if (wmCurrentRound > parseInt(wmTotalRounds)) {
                endWordMatchGame();
                return;
            }
            
            if (wmWordsList.length === 0) {
                await preloadWmWords();
                if (wmWordsList.length === 0) {
                    feedbackElement.textContent = "Error: No words loaded!";
                    return;
                }
            }

            wmCorrectWord = wmWordsList[Math.floor(Math.random() * wmWordsList.length)];
            if (imageElement) {
                imageElement.src = `images/${wmCorrectWord.toLowerCase()}.png`;
                imageElement.alt = `Image for ${wmCorrectWord}`;
            }
            const incorrectWords = wmWordsList.filter(word => word !== wmCorrectWord).sort(() => Math.random() - 0.5).slice(0, 2);
            const wordChoices = shuffleArray([wmCorrectWord, ...incorrectWords]); // Assumes shuffleArray is global

            wordChoicesContainer.innerHTML = '';
            wordChoices.forEach(word => {
                const wordDiv = document.createElement('div');
                wordDiv.classList.add('word');
                wordDiv.textContent = word.toUpperCase();
                wordDiv.addEventListener('click', function() {
                    checkWmAnswer(word, wmCorrectWord);
                });
                
                wordChoicesContainer.appendChild(wordDiv);
            });

            feedbackElement.textContent = "";
            updateWmScorecard();
            startWmTimer();
        }

        function checkWmAnswer(selectedWord, correctWordParam) {
            if (selectedWord.trim().toLowerCase() === correctWordParam.trim().toLowerCase()) {
                stopWmTimer();
                playSuccessSound(); // Assumes playSuccessSound is global
                feedbackElement.textContent = "✅ CORRECT!";
                feedbackElement.style.color = "green";
                wmCorrectAnswers++;
                updateWmScorecard();
                setTimeout(loadNewWordRound, 1500);
            } else {
                wmIncorrectAttempts++;
                playIncorrectSound(); // Assumes playIncorrectSound is global
                if (wmIncorrectAttempts >= 2) {
                    feedbackElement.textContent = `❌ Incorrect. The word was "${correctWordParam}".`;
                    feedbackElement.style.color = "red";
                    updateWmScorecard(); 
                    setTimeout(loadNewWordRound, 2000); 
                } else {
                    feedbackElement.textContent = "❌ TRY AGAIN! (1 attempt left)";
                    feedbackElement.style.color = "red";
                }
            }
        }

        function updateWmScorecard() {
            wmScoreDisplay.textContent = `Score: ${wmCorrectAnswers}`;
            wmRoundDisplay.textContent = `Round: ${wmCurrentRound} / ${wmTotalRounds}`;
        }

        function endWordMatchGame() {
            stopWmTimer();
            wmGameOverModal.classList.remove('hidden');
            wmActiveGameArea.classList.add('hidden');
            wmGameInfo.classList.add('hidden');
            feedbackElement.textContent = "";
            wmFinalScoreText.textContent = `You scored ${wmCorrectAnswers} out of ${wmTotalRounds} correctly!`;
        }

        function startWmTimer() {
            stopWmTimer();
            let timerDurationValue = wmTimerSetting.value;
            let actualDurationSeconds;

            if (timerDurationValue === 'custom') {
                const customSeconds = parseInt(wmTimerCustomInput.value);
                actualDurationSeconds = (customSeconds > 0 && customSeconds <= 300) ? customSeconds : 0; // Max 300s
            } else if (timerDurationValue === 'off') {
                actualDurationSeconds = 0;
            } else {
                actualDurationSeconds = parseInt(timerDurationValue);
            }

            if (actualDurationSeconds <= 0) {
                wmTimerDisplay.textContent = 'Time: Off';
                return;
            }
            wmTimeLeft = actualDurationSeconds;
            wmTimerDisplay.textContent = `Time: ${wmTimeLeft}s`;

            wmTimerInterval = setInterval(() => {
                wmTimeLeft--;
                wmTimerDisplay.textContent = `Time: ${wmTimeLeft}s`;
                if (wmTimeLeft <= 0) {
                    handleWmTimeUp();
                }
            }, 1000);
        }

        function stopWmTimer() {
            clearInterval(wmTimerInterval);
            wmTimerInterval = null;
        }

        function handleWmTimeUp() {
            stopWmTimer();
            playIncorrectSound(); // Assumes playIncorrectSound is global
            feedbackElement.textContent = `⏰ Time's up! The correct word was "${wmCorrectWord}".`;
            feedbackElement.style.color = "orange";
            setTimeout(loadNewWordRound, 2000);
        }

        // Event Listeners
        startWmGameBtn.addEventListener('click', startWordMatchGame);
        wmPlayAgainBtn.addEventListener('click', startWordMatchGame);
        wmBackToMenuBtn.addEventListener('click', () => { window.location.href = 'index.html'; });

        wmRoundsSetting.addEventListener('change', function() {
            wmRoundsCustomInput.classList.toggle('hidden', this.value !== 'custom');
            if (this.value === 'custom') wmRoundsCustomInput.focus();
        });
        wmTimerSetting.addEventListener('change', function() {
            wmTimerCustomInput.classList.toggle('hidden', this.value !== 'custom');
            if (this.value === 'custom') wmTimerCustomInput.focus();
        });

        // Initial UI State
        wmGameSettingsDiv.classList.remove('hidden');
        wmGameInfo.classList.add('hidden');
        wmActiveGameArea.classList.add('hidden');
        wmGameOverModal.classList.add('hidden');

        preloadWmWords(); // Preload words when the page/script for word-match loads               
    }
});