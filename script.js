// script.js

// --- Utility Functions (can be defined globally, outside specific DOMContentLoaded handlers) ---
async function loadWords() {
    try {
        const response = await fetch('words.json');
        if (!response.ok) throw new Error('Failed to load words.json');
        const data = await response.json();
        // console.log("Loaded words:", data.words); // Commented out for less console noise
        return data.words;
    } catch (error) {
        console.error('Error loading words:', error);
        return [];
    }
}

async function setupGame() {
    const words = await loadWords();
    if (words.length === 0) {
        console.error("No words loaded—check words.json!");
        return { correctWord: null, wordChoices: [] };
    }
    const correctWord = words[Math.floor(Math.random() * words.length)];
    const imageElement = document.querySelector('.image');
    if (imageElement) {
        imageElement.src = `images/${correctWord.toLowerCase()}.png`;
        imageElement.id = `images/${correctWord.toLowerCase()}Target`;
    } else {
        console.warn("'.image' element not found for word-match.html setup.");
    }
    const incorrectWords = words.filter(word => word !== correctWord).sort(() => Math.random() - 0.5).slice(0, 2);
    const wordChoices = [correctWord, ...incorrectWords].sort(() => Math.random() - 0.5);
    return { correctWord, wordChoices };
}

function playSuccessSound() {
    const audio = new Audio('correct.mp3');
    audio.play();
}
function playIncorrectSound() {
    const audio = new Audio('incorrect.mp3');
    audio.play();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- ALL DOM MANIPULATION AND EVENT LISTENERS GO INSIDE THIS ONE DOMContentLoaded block ---
document.addEventListener('DOMContentLoaded', function() {

    // --- Main Menu Button Logic (applies to ANY page with #main-btn) ---
    const mainButton = document.getElementById('main-btn');
    if (mainButton) {
        mainButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // --- Word Matching Game (word-match.html) Specific Logic ---
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
                wmWordsList = await loadWords();
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
            const wordChoices = shuffleArray([wmCorrectWord, ...incorrectWords]);

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
                playSuccessSound();
                feedbackElement.textContent = "✅ CORRECT!";
                feedbackElement.style.color = "green";
                wmCorrectAnswers++;
                updateWmScorecard();
                setTimeout(loadNewWordRound, 1500);
            } else {
                wmIncorrectAttempts++;
                playIncorrectSound();
                if (wmIncorrectAttempts >= 2) {
                    feedbackElement.textContent = `❌ Incorrect. The word was "${correctWordParam}".`;
                    feedbackElement.style.color = "red";
                    // Score is not incremented
                    updateWmScorecard(); // Update to show current score, even if not incremented
                    setTimeout(loadNewWordRound, 2000); // Move to next round
                } else {
                    feedbackElement.textContent = "❌ TRY AGAIN! (1 attempt left)";
                    feedbackElement.style.color = "red";
                    // Timer continues if active
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
            playIncorrectSound();
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


    // --- Type the Animal Name Game (type-animal-game.html) Specific Logic ---
    const animalInput = document.getElementById('animal-input');
    const animalImg = document.getElementById('animal-img');
    const checkBtn = document.getElementById('check-btn');
    const hintBtn = document.getElementById('hint-btn');
    const hintDisplay = document.getElementById('hint-display');
    const messageDisplay = document.getElementById('message');

    // New elements for score/rounds
    const animalRoundsSetting = document.getElementById('animal-rounds-setting');
    const animalRoundsCustomInput = document.getElementById('animal-rounds-custom'); // New
    const startAnimalGameBtn = document.getElementById('start-animal-game-btn');
    const animalGameInfo = document.getElementById('animal-game-info');
    const animalRoundDisplay = document.getElementById('animal-round-display');
    const animalScoreDisplay = document.getElementById('animal-score-display');
    const animalGameArea = document.getElementById('animal-game-area'); // .animal-display
    const animalInputControls = document.getElementById('animal-input-controls'); // .input-area

    // New elements for Animal Game Timer
    const animalTimerSetting = document.getElementById('animal-timer-setting');
    const animalTimerCustomInput = document.getElementById('animal-timer-custom'); // New
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
    let animalIncorrectAttempts = 0; // New: Track incorrect attempts for Type Animal

    if (animalInput) { // Check if we are on the animal game page

        // Function to reset and start a new animal game
        function startAnimalGame() {
            if (animalRoundsSetting.value === 'custom') {
                const customRounds = parseInt(animalRoundsCustomInput.value);
                totalAnimalRounds = (customRounds > 0) ? customRounds.toString() : '5'; // Default to 5 if invalid
            } else {
                totalAnimalRounds = animalRoundsSetting.value;
            }

            // Timer setting will be read in startAnimalTimer
            currentAnimalRound = 0;
            correctAnimalAnswers = 0;

            // Hide settings, show game area
            document.querySelector('.game-settings').classList.add('hidden');
            animalGameInfo.classList.remove('hidden');
            animalGameArea.classList.remove('hidden');
            animalInputControls.classList.remove('hidden');
            gameOverModal.classList.add('hidden'); // Hide modal if it was open

            updateAnimalScorecard(); // Initial scorecard display
            loadNewAnimalRound();
        }

        async function loadNewAnimalRound() {
            currentAnimalRound++;
            stopAnimalTimer(); // Stop any previous timer
            animalIncorrectAttempts = 0; // Reset incorrect attempts for the new round
            // Since 'unlimited' is removed, totalAnimalRounds will always be a numeric string.
            // The game should end if currentAnimalRound exceeds the selected totalAnimalRounds.
            if (currentAnimalRound > parseInt(totalAnimalRounds)) {
                endAnimalGame();
                return;
            }

            const allWords = await loadWords();
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
            hintBtn.style.display = 'inline-block'; // Ensure hint button is visible

            updateAnimalScorecard();
            startAnimalTimer(); // Start timer for the new animal
            animalInput.focus(); // Keep focus on input
        }

        function typeAnimalCheckAnswer() {
            const userAnswer = animalInput.value.trim().toLowerCase();
            if (userAnswer === currentAnimalName) {
                stopAnimalTimer(); // Stop timer on correct answer
                playSuccessSound();
                messageDisplay.textContent = "Correct! Well done!";
                messageDisplay.style.color = "green";
                correctAnimalAnswers++; // Increment score
                updateAnimalScorecard();
                setTimeout(loadNewAnimalRound, 1500);
            } else {
                animalIncorrectAttempts++;
                playIncorrectSound();
                if (animalIncorrectAttempts >= 2) {
                    messageDisplay.textContent = `❌ Incorrect. The animal was "${currentAnimalName}".`;
                    messageDisplay.style.color = "red";
                    // Score is not incremented
                    updateAnimalScorecard();
                    setTimeout(loadNewAnimalRound, 2000); // Move to next round
                } else {
                    messageDisplay.textContent = "❌ TRY AGAIN! (1 attempt left)";
                    messageDisplay.style.color = "red";
                    // Timer continues if active and answer is wrong
                }
            }
        }


        function showAnimalHint() {
            const hintLength = Math.ceil(currentAnimalName.length / 2);
            hintDisplay.textContent = `Hint: Starts with "${currentAnimalName.substring(0, hintLength)}"`;
            hintBtn.style.display = 'none'; // Hide hint button after showing hint
        }

        function updateAnimalScorecard() {
            animalScoreDisplay.textContent = `Score: ${correctAnimalAnswers}`;
            animalRoundDisplay.textContent = `Round: ${currentAnimalRound} / ${totalAnimalRounds}`;
        }

        function endAnimalGame() {
            stopAnimalTimer();
            gameOverModal.classList.remove('hidden');
            animalGameArea.classList.add('hidden'); // Hide game elements
            animalInputControls.classList.add('hidden');
            animalGameInfo.classList.add('hidden');
            messageDisplay.textContent = ""; // Clear any lingering message
            hintDisplay.textContent = "";

            finalScoreText.textContent = `You answered ${correctAnimalAnswers} out of ${totalAnimalRounds} correctly!`;
        }

        // --- Animal Game Timer Functions ---
        function startAnimalTimer() {
            stopAnimalTimer(); // Clear any existing timer
            let timerDurationValue = animalTimerSetting.value;
            let actualDurationSeconds;

            if (timerDurationValue === 'custom') {
                const customSeconds = parseInt(animalTimerCustomInput.value);
                actualDurationSeconds = (customSeconds > 0) ? customSeconds : 0; // 0 will mean 'off'
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
            playIncorrectSound();
            messageDisplay.textContent = `⏰ Time's up! The animal was "${currentAnimalName}".`;
            messageDisplay.style.color = "orange";
            setTimeout(loadNewAnimalRound, 2000); // Load next animal after a delay
        }

        // Event Listeners for Type Animal Game
        startAnimalGameBtn.addEventListener('click', startAnimalGame);
        checkBtn.addEventListener('click', typeAnimalCheckAnswer);
        hintBtn.addEventListener('click', showAnimalHint);
        animalInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                typeAnimalCheckAnswer();
            }
        });

        // Event listeners for Game Over Modal buttons
        playAgainBtn.addEventListener('click', startAnimalGame); // Resets and starts a new game
        backToMenuBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });

        // Event listeners for custom input visibility
        animalRoundsSetting.addEventListener('change', function() {
            if (this.value === 'custom') {
                animalRoundsCustomInput.classList.remove('hidden');
                animalRoundsCustomInput.focus();
            } else {
                animalRoundsCustomInput.classList.add('hidden');
            }
        });

        animalTimerSetting.addEventListener('change', function() {
            if (this.value === 'custom') {
                animalTimerCustomInput.classList.remove('hidden');
                animalTimerCustomInput.focus();
            } else {
                animalTimerCustomInput.classList.add('hidden');
            }
        });

        // Initial setup for the animal game page: show settings, hide game
        document.querySelector('.game-settings').classList.remove('hidden');
        animalGameInfo.classList.add('hidden');
        animalGameArea.classList.add('hidden');
        animalInputControls.classList.add('hidden');
        gameOverModal.classList.add('hidden'); // Ensure modal is hidden initially
        // No initial loadNewAnimalRound() here, as it's triggered by startAnimalGameBtn
    }


    // --- Clock Game (read-clock-game.html) Specific Logic ---
    const clockDisplay = document.querySelector('.clock-display');
    if (clockDisplay) { // Check if we are on the clock game page
        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const timeInputHour = document.getElementById('hour-input'); // Specific input field
        const timeInputMinute = document.getElementById('minute-input'); // Specific input field

        // Check/Next buttons for Enter Time mode
        const checkTimeBtnEnter = document.getElementById('check-time-btn');
        const nextTimeBtnEnter = document.getElementById('next-time-btn');

        // Check/Next buttons for Set Time mode
        const checkTimeBtnSet = document.getElementById('check-time-btn-set');
        const nextTimeBtnSet = document.getElementById('next-time-btn-set');

        const feedbackClock = document.getElementById('feedback-clock');
        const difficultyLevelSelect = document.getElementById('difficulty-level');

        // Mode selection elements
        const modeRadioButtons = document.querySelectorAll('input[name="game-mode"]');
        const modeContents = {
            'multiple-choice': document.getElementById('mode-multiple-choice-content'),
            'enter-time': document.getElementById('mode-enter-time-content'),
            'set-time': document.getElementById('mode-set-time-content')
        };
        const targetSetTimeText = document.getElementById('target-set-time-text');

        // Timer & Rounds Elements for Clock Game
        const timerSetting = document.getElementById('timer-setting');
        const roundsSetting = document.getElementById('rounds-setting');
        const startGameBtn = document.getElementById('start-game-btn');
        const clockGameInfo = document.querySelector('.clock-game-container .game-info');
        const timerDisplay = document.getElementById('timer-display');
        const roundDisplay = document.getElementById('round-display');
        const scoreDisplayClock = document.getElementById('score-display-clock'); // New Score Display Element
        const gameSettings = document.querySelector('.clock-game-container .game-settings');


        let currentDifficulty = parseInt(difficultyLevelSelect.value);
        let correctHour, correctMinute;
        let currentMode = document.querySelector('input[name="game-mode"]:checked').value;

        // Timer & Round Variables for Clock Game
        let timerInterval;
        let timeLeft;
        let totalRoundsClock;
        let currentRoundClock = 0;
        let correctAnswersClock = 0;
        let totalQuestionsAttemptedClock = 0;
        let clockMcIncorrectAttempts = 0; // New: Track incorrect attempts for Clock MC
        let clockEnterTimeIncorrectAttempts = 0; // New: For Enter Time mode
        let clockSetTimeIncorrectAttempts = 0; // New: For Set Time mode


        // Helper to hide all mode content divs
        function hideAllModeContent() {
            if (modeContents['multiple-choice']) modeContents['multiple-choice'].classList.add('hidden');
            if (modeContents['enter-time']) modeContents['enter-time'].classList.add('hidden');
            if (modeContents['set-time']) modeContents['set-time'].classList.add('hidden');
        }

        // Function to switch visible mode content based on currentMode
        function switchMode(mode) {
            hideAllModeContent(); // Hide all first
            if (modeContents[mode]) modeContents[mode].classList.remove('hidden'); // Show the selected mode's content

            // Additional visibility adjustments for controls based on mode
            if (mode === 'multiple-choice') {
                if (document.querySelector('#mode-enter-time-content')) { // Check if the container exists
                    const inputGroup = document.querySelector('#mode-enter-time-content .time-input-group');
                    const controls = document.querySelector('#mode-enter-time-content .controls');
                    if (inputGroup) inputGroup.classList.add('hidden');
                    if (controls) controls.classList.add('hidden');
                }
                if (document.querySelector('#mode-set-time-content')) { // Check if the container exists
                    const controls = document.querySelector('#mode-set-time-content .controls');
                    if (controls) controls.classList.add('hidden');
                }
            } else if (mode === 'enter-time') {
                if (document.querySelector('#mode-enter-time-content')) {
                    const inputGroup = document.querySelector('#mode-enter-time-content .time-input-group');
                    const controls = document.querySelector('#mode-enter-time-content .controls');
                    if (inputGroup) inputGroup.classList.remove('hidden');
                    if (controls) controls.classList.remove('hidden');
                }
                if (document.querySelector('#mode-set-time-content')) {
                    const controls = document.querySelector('#mode-set-time-content .controls');
                    if (controls) controls.classList.add('hidden');
                }
            } else if (mode === 'set-time') {
                if (document.querySelector('#mode-enter-time-content')) {
                    const inputGroup = document.querySelector('#mode-enter-time-content .time-input-group');
                    const controls = document.querySelector('#mode-enter-time-content .controls');
                    if (inputGroup) inputGroup.classList.add('hidden');
                    if (controls) controls.classList.add('hidden');
                }
                if (document.querySelector('#mode-set-time-content')) {
                    const controls = document.querySelector('#mode-set-time-content .controls');
                    if (controls) controls.classList.remove('hidden');
                }
            }

            // Trigger a new round whenever the mode changes
            loadNewClockRound();
        }

        // NEW: Start Clock Game Function
        function startClockGame() {
            currentDifficulty = parseInt(difficultyLevelSelect.value);
            currentMode = document.querySelector('input[name="game-mode"]:checked').value;
            totalRoundsClock = roundsSetting.value;
            timeLeft = parseInt(timerSetting.value); // Initial time for the round
            currentRoundClock = 0; // Reset for new game
            correctAnswersClock = 0; // Reset for new game
            totalQuestionsAttemptedClock = 0; // Reset for new game

            gameSettings.classList.add('hidden'); // Hide settings
            clockGameInfo.classList.remove('hidden'); // Show game info (rounds, timer)

            switchMode(currentMode); // This will also call loadNewClockRound()
            updateClockScorecard(); // Initial scorecard display
        }

        // NEW: Timer Functions
        function startTimer() {
            stopTimer(); // Clear any existing timer
            const selectedTime = parseInt(timerSetting.value);
            if (isNaN(selectedTime) || selectedTime <= 0) { // Timer is off (value is 'off' or 0)
                timerDisplay.textContent = 'Time: -s';
                return;
            }

            timeLeft = selectedTime;
            timerDisplay.textContent = `Time: ${timeLeft}s`;

            timerInterval = setInterval(() => {
                timeLeft--;
                timerDisplay.textContent = `Time: ${timeLeft}s`;

                if (timeLeft <= 0) {
                    stopTimer();
                    handleTimeUp();
                }
            }, 1000);
        }

        function stopTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }

        function handleTimeUp() {
            feedbackClock.textContent = `⏰ Time's up! The correct time was ${formatTime(correctHour, correctMinute)}.`;
            feedbackClock.style.color = "orange";
            playIncorrectSound();
            // totalQuestionsAttemptedClock is already incremented in loadNewClockRound
            updateClockScorecard();

            setTimeout(loadNewClockRound, 2000);
        }

        // NEW: Update Clock Scorecard Function
        function updateClockScorecard() {        
            roundDisplay.textContent = `Round: ${currentRoundClock} / ${totalRoundsClock}`;
            scoreDisplayClock.textContent = `Score: ${correctAnswersClock}`; // Corrected variable name
        }

        // NEW: End Clock Game Function
        function endClockGame() {
            stopTimer(); // Ensure timer stops
            feedbackClock.textContent = `Game Over! You answered ${correctAnswersClock} out of ${totalRoundsClock} questions correctly.`;
            feedbackClock.style.color = "purple";

            hideAllModeContent();
            if (document.querySelector('#mode-enter-time-content .time-input-group')) document.querySelector('#mode-enter-time-content .time-input-group').classList.add('hidden');
            if (document.querySelector('#mode-enter-time-content .controls')) document.querySelector('#mode-enter-time-content .controls').classList.add('hidden');
            if (document.querySelector('#mode-set-time-content .controls')) document.querySelector('#mode-set-time-content .controls').classList.add('hidden');

            clockGameInfo.classList.add('hidden');
            gameSettings.classList.remove('hidden');
            startGameBtn.textContent = 'Play Again';
        }


        // Function to generate a random time based on difficulty
        function generateRandomTime(difficulty) {
            let hour = Math.floor(Math.random() * 12) + 1;
            let minute;

            let possibleMinutes = [];
            switch (difficulty) {
                case 1: // O'Clock
                    possibleMinutes = [0];
                    break;
                case 2: // Half-Hour
                    possibleMinutes = [0, 30];
                    break;
                case 3: // Quarter-Hour
                    possibleMinutes = [0, 15, 30, 45];
                    break;
                case 4: // Five-Minute Intervals
                    for (let i = 0; i < 60; i += 5) {
                        possibleMinutes.push(i);
                    }
                    break;
                case 5: // Every Minute
                    for (let i = 0; i < 60; i++) {
                        possibleMinutes.push(i);
                    }
                    break;
                default:
                    for (let i = 0; i < 60; i += 5) {
                        possibleMinutes.push(i);
                    }
                    console.warn("Invalid difficulty level, defaulting to 5-minute intervals.");
            }
            minute = possibleMinutes[Math.floor(Math.random() * possibleMinutes.length)];
            return { hour, minute };
        }

        // --- Core Clock Game Functions - MODIFIED ---
        function setClockHands(hour, minute) {
            const actualHourForCalc = hour % 12; // 0 for 12 o'clock, 1 for 1, etc.
            const hourDegrees = (actualHourForCalc * 30) + (minute * 0.5); // 30 deg/hour, 0.5 deg/min
            if (hourHand) {
                 // --- MODIFIED: Reverted to translateX(-50%) only ---
                 hourHand.style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;
            }
            const minuteDegrees = minute * 6; // 6 deg/minute
            if (minuteHand) {
                 // --- MODIFIED: Reverted to translateX(-50%) only ---
                 minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
            }
        }
        // Function to format time for display (e.g., 3:05, 12:45)
        function formatTime(h, m) {
            const formattedM = m < 10 ? `0${m}` : m;
            return `${h}:${formattedM}`;
        }

        // Function to generate choices for Multiple Choice mode
        function generateMultipleChoices(correctHour, correctMinute, difficulty) {
            const choices = new Set();
            choices.add(formatTime(correctHour, correctMinute));

            let possibleMinutesForDistractor = [];
            switch (difficulty) {
                case 1: possibleMinutesForDistractor = [0]; break;
                case 2: possibleMinutesForDistractor = [0, 30]; break;
                case 3: possibleMinutesForDistractor = [0, 15, 30, 45]; break;
                case 4: for (let i = 0; i < 60; i += 5) possibleMinutesForDistractor.push(i); break;
                case 5: for (let i = 0; i < 60; i++) possibleMinutesForDistractor.push(i); break;
                default: for (let i = 0; i < 60; i += 5) possibleMinutesForDistractor.push(i); break;
            }

            while (choices.size < 3) {
                let randomHour = Math.floor(Math.random() * 12) + 1;
                let randomMinute = possibleMinutesForDistractor[Math.floor(Math.random() * possibleMinutesForDistractor.length)];

                if (Math.abs(randomHour - correctHour) < 2 && Math.abs(randomMinute - correctMinute) < 15 && randomMinute !== correctMinute) {
                    continue;
                }
                if (randomHour === correctHour && randomMinute === correctMinute) {
                    continue;
                }

                choices.add(formatTime(randomHour, randomMinute));
            }
            return shuffleArray(Array.from(choices));
        }

                // --- drawClockNumbersAndTicks - REPLACED WITH DEMO'S LOGIC ---
        function drawClockNumbersAndTicks() {
            if (!clockDisplay) {
                console.warn("Clock display not found, cannot draw numbers and ticks.");
                return;
            }
            // Clear existing numbers and ticks
            clockDisplay.querySelectorAll('.clock-number, .minute-tick, .hour-tick').forEach(el => el.remove());

            const radius = clockDisplay.offsetWidth / 2;
            const inset = 10; // Inset to keep ticks inside the border visually
            const tickRadius = radius - inset; // Radius for ticks to sit inside
            const numberRadius = radius - 25; // Radius for numbers to sit further inside

            // Draw ticks
            for (let i = 0; i < 60; i++) {
                const angleDeg = i * 6 - 90; // Angle for ticks, adjusted for 12 o'clock at top
                const angleRad = angleDeg * Math.PI / 180;
                const x = radius + tickRadius * Math.cos(angleRad)-7; //
                const y = radius + tickRadius * Math.sin(angleRad)-9; //

                const tick = document.createElement('div');
                tick.classList.add(i % 5 === 0 ? 'hour-tick' : 'minute-tick');
                tick.style.left = `${x}px`;
                tick.style.top = `${y}px`;
                // Note: The transform `translate(-50%, -50%)` is now handled by style.css for ticks
                tick.style.transform += ` rotate(${angleDeg + 90}deg)`; // Add specific tick rotation
                clockDisplay.appendChild(tick);
            }

            // Draw numbers
            for (let i = 1; i <= 12; i++) {
                const angleDeg = i * 30 - 90; // Angle for numbers, adjusted for 12 o'clock at top
                const angleRad = angleDeg * Math.PI / 180;
                const x = radius + numberRadius * Math.cos(angleRad)-12; //
                const y = radius + numberRadius * Math.sin(angleRad)-15; //

                const num = document.createElement('div');
                num.classList.add('clock-number');
                num.style.left = `${x}px`;
                num.style.top = `${y}px`;
                num.textContent = i;
                // Note: The transform `translate(-50%, -50%)` is now handled by style.css for numbers
                clockDisplay.appendChild(num);
            }
        }

        // Main function to load a new clock round
        function loadNewClockRound() {
            stopTimer();
            currentRoundClock++;
            totalQuestionsAttemptedClock++;

            // Reset incorrect attempts for MC mode when a new round starts
            if (currentMode === 'multiple-choice') clockMcIncorrectAttempts = 0;
            if (currentMode === 'enter-time') clockEnterTimeIncorrectAttempts = 0;
            if (currentMode === 'set-time') clockSetTimeIncorrectAttempts = 0;

            if (currentRoundClock > parseInt(totalRoundsClock)) {
                endClockGame();
                return;
            }

            feedbackClock.textContent = '';
            if (timeInputHour) timeInputHour.value = '';
            if (timeInputMinute) timeInputMinute.value = '';

            const mcChoiceButtons = document.querySelectorAll('#mode-multiple-choice-content .choice-button');
            mcChoiceButtons.forEach(button => {
                button.textContent = '';
                button.classList.remove('correct', 'incorrect');
                button.disabled = false;
            });

            const time = generateRandomTime(currentDifficulty);
            correctHour = time.hour;
            correctMinute = time.minute;

            setClockHands(correctHour, correctMinute);

            updateClockScorecard();
            startTimer();

            if (currentMode === 'multiple-choice') {
                const choices = generateMultipleChoices(correctHour, correctMinute, currentDifficulty);
                mcChoiceButtons.forEach((button, index) => {
                    button.textContent = choices[index];
                    button.onclick = () => checkMultipleChoiceAnswer(button, choices[index]);
                });
            } else if (currentMode === 'set-time') {
                targetSetTimeText.textContent = formatTime(correctHour, correctMinute);
                let randomStartHour, randomStartMinute;
                do {
                    randomStartHour = Math.floor(Math.random() * 12) + 1;
                    randomStartMinute = Math.floor(Math.random() * 12) * 5;
                } while (randomStartHour === correctHour && randomStartMinute === correctMinute);

                setClockHands(randomStartHour, randomStartMinute);
            }
            if (currentMode === 'enter-time' && timeInputHour) {
                timeInputHour.focus();
            }
        }

        // --- Draggable Minute Hand Logic - Corrected Transform calls (from previous discussion) ---
        let isDraggingMinuteHand = false;
        let clockRect;
        let initialMinuteHandStartAngle = 0;
        let initialHourHandStartAngle = 0;
        let accumulatedMinuteHandRotation = 0;

        function getRotationDegrees(element) {
            const transform = element.style.transform;
            const match = transform.match(/rotate\(([^)]+)deg\)/);
            if (match && match[1]) {
                let angle = parseFloat(match[1]);
                angle = (angle % 360 + 360) % 360; // Normalize to 0-360
                return angle;
            }
            return 0;
        }

        if (minuteHand && clockDisplay && hourHand) {
            const startDrag = (e) => {
                if (currentMode !== 'set-time') return;
                isDraggingMinuteHand = true;
                clockRect = clockDisplay.getBoundingClientRect();
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
                minuteHand.style.zIndex = '11';
                hourHand.style.zIndex = '10';

                initialMinuteHandStartAngle = getRotationDegrees(minuteHand);
                initialHourHandStartAngle = getRotationDegrees(hourHand);
                accumulatedMinuteHandRotation = 0;
            };

            const drag = (e) => {
                if (!isDraggingMinuteHand) return;
                if (e.type === 'touchmove') {
                    e.preventDefault();
                }

                let clientX = e.clientX;
                let clientY = e.clientY;
                if (e.type === 'touchmove' && e.touches && e.touches[0]) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                }

                const centerX = clockRect.left + clockRect.width / 2;
                const centerY = clockRect.top + clockRect.height / 2;

                const dx = clientX - centerX;
                const dy = clientY - centerY;

                let angleRad = Math.atan2(dy, dx);
                let currentMouseAngleDegrees = (angleRad * (180 / Math.PI) + 360 + 90) % 360;

                const snappedCurrentMouseAngleDegrees = Math.round(currentMouseAngleDegrees / 6) * 6;

                let lastKnownMinuteAngle = getRotationDegrees(minuteHand);

                let angleDeltaForAccumulation = snappedCurrentMouseAngleDegrees - lastKnownMinuteAngle;

                if (angleDeltaForAccumulation > 180) {
                    angleDeltaForAccumulation -= 360;
                } else if (angleDeltaForAccumulation < -180) {
                    angleDeltaForAccumulation += 360;
                }

                accumulatedMinuteHandRotation += angleDeltaForAccumulation;

                // Ensure translateX(-50%) is used for hand rotation in drag
                const newMinuteHandDegrees = (initialMinuteHandStartAngle + accumulatedMinuteHandRotation + 36000) % 360;
                minuteHand.style.transform = `translateX(-50%) rotate(${newMinuteHandDegrees}deg)`;

                // Ensure translateX(-50%) is used for hand rotation in drag
                const newHourHandDegrees = (initialHourHandStartAngle + (accumulatedMinuteHandRotation / 12) + 36000) % 360;
                hourHand.style.transform = `translateX(-50%) rotate(${newHourHandDegrees}deg)`;

            };

            const endDrag = () => {
                isDraggingMinuteHand = false;
                minuteHand.style.zIndex = '5';
                hourHand.style.zIndex = '5';
            };

            // Mouse events
            minuteHand.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', endDrag);

            minuteHand.addEventListener('touchstart', startDrag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('touchend', endDrag);
        } else {
            console.warn("Minute hand or clock display or hour hand element not found for drag functionality.");
        }

        
        // Function to check answer for Enter Time mode
        function checkEnterTimeAnswer() { // Renamed for clarity
            stopTimer(); // Stop timer when answer is checked

            const enteredHour = parseInt(timeInputHour.value);
            const enteredMinute = parseInt(timeInputMinute.value);

            if (isNaN(enteredHour) || isNaN(enteredMinute) || enteredHour < 1 || enteredHour > 12 || enteredMinute < 0 || enteredMinute > 59) {
                feedbackClock.textContent = 'Invalid time. Use HH:MM (e.g., 3:05, 12:40).';
                feedbackClock.style.color = 'red';
                playIncorrectSound();
                // Do not advance, allow user to correct. Timer might still be running or off.
                return;
            }

            const formattedCorrectTime = formatTime(correctHour, correctMinute);
            const formattedEnteredTime = formatTime(enteredHour, enteredMinute);

            if (enteredHour === correctHour && enteredMinute === correctMinute) {
                playSuccessSound();
                feedbackClock.textContent = `✅ Correct! It's ${formattedCorrectTime}.`;
                feedbackClock.style.color = 'green';
                // correctAnswersClock is incremented in checkMultipleChoiceAnswer
                updateClockScorecard();
                setTimeout(loadNewClockRound, 1500);
            } else {
                clockEnterTimeIncorrectAttempts++;
                playIncorrectSound();
                if (clockEnterTimeIncorrectAttempts >= 2) {
                    feedbackClock.textContent = `❌ Incorrect. You entered ${formattedEnteredTime}. The correct time was ${formattedCorrectTime}.`;
                    feedbackClock.style.color = 'red';
                    updateClockScorecard(); // Update score display even if not incremented
                    setTimeout(loadNewClockRound, 2000); // Move to next round
                } else {
                    feedbackClock.textContent = `❌ TRY AGAIN! (1 attempt left)`;
                    feedbackClock.style.color = 'red';
                    // Allow another attempt, timer continues if active
                    timeInputHour.focus(); // Focus on hour input for quick correction
                }
            }
        }

        // Function to check answer for Multiple Choice mode
        function checkMultipleChoiceAnswer(clickedButton, chosenTime) {
            stopTimer();
            const formattedCorrectTime = formatTime(correctHour, correctMinute);
            const mcChoiceButtons = document.querySelectorAll('#mode-multiple-choice-content .choice-button');

            if (chosenTime === formattedCorrectTime) {
                playSuccessSound();
                feedbackClock.textContent = `✅ Correct! It's ${formattedCorrectTime}.`;
                feedbackClock.style.color = 'green';
                correctAnswersClock++;
                updateClockScorecard();
                setTimeout(loadNewClockRound, 2000);
            } else {
                clockMcIncorrectAttempts++; // Corrected variable name
                playIncorrectSound();
                if (clockMcIncorrectAttempts >= 2) {
                    feedbackClock.textContent = `❌ Incorrect. The correct time was ${formattedCorrectTime}.`;
                    feedbackClock.style.color = 'red';
                    updateClockScorecard();
                    setTimeout(loadNewClockRound, 2000);
                } else {
                    feedbackClock.textContent = `❌ Incorrect. Please try again.`;
                    feedbackClock.style.color = 'red';
                }
            }
        }

        // Function to check answer for Set Time mode
        function checkSetTimeAnswer() {
            stopTimer();
            // totalQuestionsAttemptedClock is already incremented in loadNewClockRound

            const formattedCorrectTime = formatTime(correctHour, correctMinute);

            // Get currently displayed angles
            const currentMinuteDegrees = getRotationDegrees(minuteHand);
            const currentHourDegrees = getRotationDegrees(hourHand);

            // Convert current hand positions to time
            const actualMinute = Math.round(currentMinuteDegrees / 6);

            // For hour, calculate base hour from hour hand angle, then consider minute contribution
            // The hour hand moves 0.5 degrees per minute.
            // So, from currentHourDegrees, subtract minute's influence to get exact integer hour's angle
            let hourAngleWithoutMinuteInfluence = (currentHourDegrees - (actualMinute * 0.5));
            // Normalize to handle wrap-around if it goes below 0 due to subtraction
            hourAngleWithoutMinuteInfluence = (hourAngleWithoutMinuteInfluence % 360 + 360) % 360;

            let actualHour = Math.round(hourAngleWithoutMinuteInfluence / 30); // Convert angle back to 0-11 hour
            if (actualHour === 0) actualHour = 12; // 0 degrees is 12 o'clock

            const formattedSetTime = formatTime(actualHour, actualMinute);


            // Precise comparison, taking into account potential rounding errors from dragging
            const toleranceMinutes = 0.5; // +/- half a minute
            const toleranceDegrees = toleranceMinutes * 6; // +/- 3 degrees

            const targetMinuteDegrees = correctMinute * 6;
            const targetHourDegrees = (correctHour % 12) * 30 + (correctMinute * 0.5);

            const isMinuteCorrect = Math.abs(currentMinuteDegrees - targetMinuteDegrees) <= toleranceDegrees ||
                                    Math.abs(currentMinuteDegrees - (targetMinuteDegrees + 360)) <= toleranceDegrees || // Handle wrap-around
                                    Math.abs(currentMinuteDegrees - (targetMinuteDegrees - 360)) <= toleranceDegrees;

            const isHourCorrect = Math.abs(currentHourDegrees - targetHourDegrees) <= toleranceDegrees ||
                                  Math.abs(currentHourDegrees - (targetHourDegrees + 360)) <= toleranceDegrees ||
                                  Math.abs(currentHourDegrees - (targetHourDegrees - 360)) <= toleranceDegrees;


            if (isMinuteCorrect && isHourCorrect) {
                playSuccessSound();
                feedbackClock.textContent = `✅ Correct! You set it to ${formattedSetTime}.`;
                feedbackClock.style.color = 'green';
                correctAnswersClock++;
                updateClockScorecard();
                setTimeout(loadNewClockRound, 2000);
            } else {
                playIncorrectSound();
                clockSetTimeIncorrectAttempts++;
                if (clockSetTimeIncorrectAttempts >= 2) {
                    feedbackClock.textContent = `❌ Incorrect. You set ${formattedSetTime}. The correct time was ${formattedCorrectTime}.`;
                    feedbackClock.style.color = 'red';
                    updateClockScorecard(); // Update score display
                    setTimeout(loadNewClockRound, 2000); // Move to next round
                } else {
                    feedbackClock.textContent = `❌ TRY AGAIN! (1 attempt left)`;
                    feedbackClock.style.color = 'red';
                    // Allow another attempt, timer continues if active
                }
            }
        }

        // Event Listeners for Clock Game
        if (checkTimeBtnEnter) { checkTimeBtnEnter.addEventListener('click', checkEnterTimeAnswer); } // Enter Time mode
        if (nextTimeBtnEnter) { nextTimeBtnEnter.addEventListener('click', loadNewClockRound); } // Enter Time mode
        if (checkTimeBtnSet) { checkTimeBtnSet.addEventListener('click', checkSetTimeAnswer); } // Set Time mode
        if (nextTimeBtnSet) { nextTimeBtnSet.addEventListener('click', loadNewClockRound); } // Set Time mode

        if (timeInputHour && timeInputMinute) {
            timeInputHour.addEventListener('input', function(event) { // Corrected this line
                let val = event.target.value.replace(/\D/g, '');
                if (val.length === 2 && timeInputMinute) {
                    timeInputMinute.focus();
                }
                if (parseInt(val, 10) > 12) event.target.value = 12;
                if (parseInt(val, 10) < 1 && val.length > 0) event.target.value = 1; // Prevent 0 hour
            });
            timeInputMinute.addEventListener('input', function(event) {
                let val = event.target.value.replace(/\D/g, '');
                if (parseInt(val, 10) > 59) event.target.value = 59;
            });
        }


        // Event listeners for game mode changes
        modeRadioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                currentMode = this.value;
                switchMode(currentMode);
            });
        });

        // Event listener for difficulty level change
        if (difficultyLevelSelect) {
            difficultyLevelSelect.addEventListener('change', function() {
                currentDifficulty = parseInt(this.value);
                loadNewClockRound();
            });
        }

        // Event listeners for timer and rounds settings (for initial setup)
        if (timerSetting) {
            timerSetting.addEventListener('change', () => {
                timeLeft = parseInt(timerSetting.value);
            });
        }
        if (roundsSetting) {
            roundsSetting.addEventListener('change', () => {
                totalRoundsClock = roundsSetting.value;
            });
        }

        // NEW: Start Game Button for Clock Game
        startGameBtn.addEventListener('click', startClockGame);


        // Initial setup for the clock game page: show settings, hide game elements
        gameSettings.classList.remove('hidden');
        clockGameInfo.classList.add('hidden');
        hideAllModeContent();
        // Hide specific controls related to modes
        if (document.querySelector('#mode-enter-time-content .time-input-group')) document.querySelector('#mode-enter-time-content .time-input-group').classList.add('hidden');
        if (document.querySelector('#mode-enter-time-content .controls')) document.querySelector('#mode-enter-time-content .controls').classList.add('hidden');
        if (document.querySelector('#mode-set-time-content .controls')) document.querySelector('#mode-set-time-content .controls').classList.add('hidden');


        drawClockNumbersAndTicks(); // Draw static clock elements once
    } // End of if (clockDisplay)

}); // END of the single DOMContentLoaded listener
                   