// script.js

// --- Utility Functions (can be defined globally, outside specific DOMContentLoaded handlers) ---
async function loadWords() {
    try {
        const response = await fetch('words.json');
        if (!response.ok) throw new Error('Failed to load words.json');
        const data = await response.json();
        console.log("Loaded words:", data.words);
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
    const wordContainer = document.querySelector('.words');
    if (wordContainer) {
        function checkAnswer(selectedWord, correctWord) {
            const feedbackElement = document.getElementById('feedback');
            if (!feedbackElement) {
                console.warn("#feedback element not found for checkAnswer.");
                return;
            }
            if (selectedWord.trim().toLowerCase() === correctWord.trim().toLowerCase()) {
                playSuccessSound();
                feedbackElement.textContent = "✅ CORRECT!";
                feedbackElement.style.color = "green";
                setTimeout(async () => {
                    feedbackElement.textContent = "";
                    const wordContainer = document.querySelector('.words');
                    if (wordContainer) {
                        wordContainer.innerHTML = "";
                    }
                    await initWordGame();
                }, 1500);
            } else {
                playIncorrectSound();
                feedbackElement.textContent = "❌ TRY AGAIN!";
                feedbackElement.style.color = "red";
            }
        }

        async function initWordGame() {
            const { correctWord, wordChoices } = await setupGame();
            const feedbackElement = document.getElementById('feedback');
            wordContainer.innerHTML = '';
            wordChoices.forEach(word => {
                const wordDiv = document.createElement('div');
                wordDiv.classList.add('word');
                wordDiv.textContent = word.toUpperCase();
                wordDiv.id = word.toLowerCase();
                wordDiv.addEventListener('click', function() {
                    checkAnswer(wordDiv.id, correctWord);
                });
                wordContainer.appendChild(wordDiv);
            });
        }
        initWordGame();

        const nextButton = document.getElementById('next-btn');
        if (nextButton) {
            nextButton.addEventListener('click', async () => {
                const feedbackElement = document.getElementById('feedback');
                if (feedbackElement) feedbackElement.textContent = "";
                await initWordGame();
            });
        } else {
             console.warn("#next-btn not found on word-match.html.");
        }
    }


    // --- Type the Animal Name Game (type-animal-game.html) Specific Logic ---
    const animalInput = document.getElementById('animal-input');
    if (animalInput) {
        const animalImg = document.getElementById('animal-img');
        const checkBtn = document.getElementById('check-btn');
        const hintBtn = document.getElementById('hint-btn');
        const hintDisplay = document.getElementById('hint-display');
        const messageDisplay = document.getElementById('message');

        let animals = [];
        let currentAnimalName = '';

        async function loadNewAnimalRound() {
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
            hintBtn.style.display = 'inline-block';
        }

        function typeAnimalCheckAnswer() {
            const userAnswer = animalInput.value.trim().toLowerCase();
            if (userAnswer === currentAnimalName) {
                playSuccessSound();
                messageDisplay.textContent = "Correct! Well done!";
                messageDisplay.style.color = "green";
                setTimeout(loadNewAnimalRound, 1500);
            } else {
                playIncorrectSound();
                messageDisplay.textContent = "Try again!";
                messageDisplay.style.color = "red";
            }
        }

        function provideHint() {
            const word = currentAnimalName;
            const scrambledLetters = shuffleArray(word.split('')).join('');
            hintDisplay.textContent = `Hint: ${scrambledLetters}`;
            hintDisplay.style.color = "#6a0dad";
        }

        if (checkBtn) { checkBtn.addEventListener('click', typeAnimalCheckAnswer); }
        if (hintBtn) { hintBtn.addEventListener('click', provideHint); }
        if (animalInput) {
            animalInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    typeAnimalCheckAnswer();
                }
            });
        }
        loadNewAnimalRound();
    }


    // --- Read the Clock Game (read-clock-game.html) Specific Logic ---
    const clockDisplay = document.querySelector('.clock-display');
    if (clockDisplay) { // Only run this code if we are on the clock game page

        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const timeInputHour = document.getElementById('hour-input');
        const timeInputMinute = document.getElementById('minute-input');
        const checkTimeBtn = document.getElementById('check-time-btn');
        const nextTimeBtn = document.getElementById('next-time-btn');
        const feedbackClock = document.getElementById('feedback-clock');
        const difficultyLevelSelect = document.getElementById('difficulty-level');

        // Mode selection elements
        const modeRadioButtons = document.querySelectorAll('input[name="game-mode"]');
        const modeContents = {
            'multiple-choice': document.getElementById('mode-multiple-choice-content'),
            'enter-time': document.getElementById('mode-enter-time-content'),
            'set-time': document.getElementById('mode-set-time-content')
        };
        // Removed: const choiceButtons = document.querySelectorAll('.choice-button'); // This was removed as it's queried inside setupMultipleChoice
        const targetSetTimeText = document.getElementById('target-set-time-text');

        let currentHour, currentMinute; // The target time for the current round
        let currentDifficulty = 4;
        if (difficultyLevelSelect) {
            currentDifficulty = parseInt(difficultyLevelSelect.value);
        } else {
            console.warn("Difficulty level select element not found. Defaulting to Level 4.");
        }

        let currentMode = document.querySelector('input[name="game-mode"]:checked').value;


        // --- Core Clock Game Functions ---

        function drawClockNumbersAndTicks() {
            const clockRadius = clockDisplay.offsetWidth / 2;
            const numberDistanceFromCenter = clockRadius * 0.85;
            const tickDistanceFromCenter = clockRadius;

            const existingElements = clockDisplay.querySelectorAll('.clock-number, .minute-tick, .hour-tick');
            existingElements.forEach(el => el.remove());

            for (let i = 1; i <= 12; i++) {
                const numberDiv = document.createElement('div');
                numberDiv.classList.add('clock-number');
                numberDiv.textContent = i;
                const angleInDegrees = (i === 12 ? 0 : i * 30);
                const angleFromTopClockwiseRad = angleInDegrees * Math.PI / 180;
                const x = numberDistanceFromCenter * Math.sin(angleFromTopClockwiseRad);
                const y = -numberDistanceFromCenter * Math.cos(angleFromTopClockwiseRad);
                numberDiv.style.left = `calc(50% + ${x}px)`;
                numberDiv.style.top = `calc(50% + ${y}px)`;
                numberDiv.style.transform = `translate(-50%, -50%)`;
                clockDisplay.appendChild(numberDiv);
            }

            for (let i = 0; i < 60; i++) {
                const tickDiv = document.createElement('div');
                const angleInDegrees = i * 6;
                const angleFromTopClockwiseRad = angleInDegrees * Math.PI / 180;

                if (i % 5 === 0) {
                    tickDiv.classList.add('hour-tick');
                    const xTick = tickDistanceFromCenter * Math.sin(angleFromTopClockwiseRad);
                    const yTick = -tickDistanceFromCenter * Math.cos(angleFromTopClockwiseRad);
                    tickDiv.style.left = `calc(50% + ${xTick}px)`;
                    tickDiv.style.top = `calc(50% + ${yTick}px)`;
                    tickDiv.style.transform = `translate(-50%, -50%) rotate(${angleInDegrees}deg)`;
                } else {
                    tickDiv.classList.add('minute-tick');
                    const xTick = tickDistanceFromCenter * Math.sin(angleFromTopClockwiseRad);
                    const yTick = -tickDistanceFromCenter * Math.cos(angleFromTopClockwiseRad);
                    tickDiv.style.left = `calc(50% + ${xTick}px)`;
                    tickDiv.style.top = `calc(50% + ${yTick}px)`;
                    tickDiv.style.transform = `translate(-50%, -50%) rotate(${angleInDegrees}deg)`;
                }
                clockDisplay.appendChild(tickDiv);
            }
        }

        function generateRandomTime() {
            currentHour = Math.floor(Math.random() * 12) + 1;
            let possibleMinutes = [];

            switch (currentDifficulty) {
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
            currentMinute = possibleMinutes[Math.floor(Math.random() * possibleMinutes.length)];
            return { hour: currentHour, minute: currentMinute };
        }

        function setClockHands(hour, minute) {
            // Converts standard 1-12 hour to 0-11 for calculation
            const actualHourForCalc = hour % 12;
            const hourDegrees = (actualHourForCalc * 30) + (minute * 0.5);
            hourHand.style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;

            const minuteDegrees = minute * 6;
            minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
        }

        function formatTime(h, m) {
            const formattedM = m < 10 ? `0${m}` : m;
            return `${h}:${formattedM}`;
        }


        // --- Mode-Specific Logic Setup ---

        function setupMultipleChoice() {
            // Get a fresh reference to the choice buttons every time this function is called
            const currentChoiceButtons = document.querySelectorAll('#mode-multiple-choice-content .choice-button');

            // Clear existing choices and handlers
            currentChoiceButtons.forEach(button => {
                button.textContent = '';
                button.onclick = null; // Ensure old handlers are removed
                button.classList.remove('correct-choice', 'incorrect-choice'); // Clear feedback styles
                button.disabled = false; // Ensure buttons are re-enabled for new round
            });

            // Set the clock to the correct time (visible for the user)
            setClockHands(currentHour, currentMinute);

            const correctTime = formatTime(currentHour, currentMinute);
            let choices = [correctTime];

            // Generate incorrect choices (distractors)
            while (choices.length < 3) {
                let randomHour, randomMinute;
                let newTime;

                // Loop until a unique and plausible distractor is found
                do {
                    randomHour = Math.floor(Math.random() * 12) + 1;
                    let possibleMinutesForDistractor = [];
                    // Generate distractors based on the current difficulty level
                    switch (currentDifficulty) {
                        case 1: possibleMinutesForDistractor = [0]; break;
                        case 2: possibleMinutesForDistractor = [0, 30]; break;
                        case 3: possibleMinutesForDistractor = [0, 15, 30, 45]; break;
                        case 4: for (let i = 0; i < 60; i += 5) possibleMinutesForDistractor.push(i); break;
                        case 5: for (let i = 0; i < 60; i++) possibleMinutesForDistractor.push(i); break;
                        default: for (let i = 0; i < 60; i += 5) possibleMinutesForDistractor.push(i); break;
                    }
                    randomMinute = possibleMinutesForDistractor[Math.floor(Math.random() * possibleMinutesForDistractor.length)];
                    newTime = formatTime(randomHour, randomMinute);
                } while (choices.includes(newTime) || (Math.abs(randomHour - currentHour) < 2 && Math.abs(randomMinute - currentMinute) < 15 && newTime !== correctTime)); // Avoid very close distractors

                choices.push(newTime);
            }

            choices = shuffleArray(choices); // Shuffle choices to randomize correct answer position

            currentChoiceButtons.forEach((button, index) => { // Use currentChoiceButtons here
                button.textContent = choices[index];
                button.onclick = () => handleChoiceClick(button, choices[index] === correctTime);
            });
        }

        function handleChoiceClick(clickedButton, isCorrect) {
            feedbackClock.textContent = ''; // Clear previous feedback
            // Get current buttons again to disable all of them
            const allChoiceButtons = document.querySelectorAll('#mode-multiple-choice-content .choice-button');
            allChoiceButtons.forEach(btn => btn.disabled = true); // Disable all choice buttons after click

            if (isCorrect) {
                playSuccessSound();
                feedbackClock.textContent = "✅ CORRECT! Well done!";
                feedbackClock.style.color = "green";
                clickedButton.classList.add('correct-choice');
                setTimeout(loadNewClockRound, 1500);
            } else {
                playIncorrectSound();
                feedbackClock.textContent = "❌ Try again!";
                feedbackClock.style.color = "red";
                clickedButton.classList.add('incorrect-choice');
                setTimeout(() => {
                    allChoiceButtons.forEach(btn => { // Use allChoiceButtons here
                        btn.disabled = false;
                        btn.classList.remove('incorrect-choice');
                    });
                }, 1000); // Re-enable for another try
            }
        }

        function setupEnterTime() {
            setClockHands(currentHour, currentMinute); // Set the clock to the target time for Enter Time
            if (timeInputHour) timeInputHour.value = '';
            if (timeInputMinute) timeInputMinute.value = '';
            // Ensure inputs are enabled
            if (timeInputHour) timeInputHour.disabled = false;
            if (timeInputMinute) timeInputMinute.disabled = false;
        }

        function setupSetTime() {
            // Display the target time
            if (targetSetTimeText) {
                targetSetTimeText.textContent = formatTime(currentHour, currentMinute);
            } else {
                console.error("targetSetTimeText element not found!"); // Debugging
            }

            // Generate a random starting time that is DIFFERENT from the target time
            let randomStartHour, randomStartMinute;
            do {
                randomStartHour = Math.floor(Math.random() * 12) + 1;
                randomStartMinute = Math.floor(Math.random() * 12) * 5; // Use 5-min intervals for random start
            } while (randomStartHour === currentHour && randomStartMinute === currentMinute); // Ensure it's different

            // Set hands to this random starting position for the user to adjust
            setClockHands(randomStartHour, randomStartMinute);

            // Disable inputs for this mode
            if (timeInputHour) timeInputHour.disabled = true;
            if (timeInputMinute) timeInputMinute.disabled = true;

            console.log(`SETUP SET TIME: Target time: ${formatTime(currentHour, currentMinute)}. Random start: ${formatTime(randomStartHour, randomStartMinute)}`); // DEBUG
        }


        // --- Main Game Loop & Mode Switching ---

        function loadNewClockRound() {
            const { hour, minute } = generateRandomTime(); // Generates the new target time (currentHour, currentMinute)

            feedbackClock.textContent = '';
            feedbackClock.style.color = '#333';

            // Based on the current mode, prepare the specific UI/logic
            switch (currentMode) {
                case 'multiple-choice':
                    setupMultipleChoice(); // This will call setClockHands for target time
                    break;
                case 'enter-time':
                    setupEnterTime(); // This will call setClockHands for target time
                    break;
                case 'set-time':
                    setupSetTime(); // This will call setClockHands for a random start time
                    break;
            }
        }

        function switchMode(mode) {
            currentMode = mode;
            // Hide all mode content divs
            Object.values(modeContents).forEach(contentDiv => {
                if (contentDiv) contentDiv.classList.add('hidden');
            });
            // Show the selected mode's content div
            if (modeContents[currentMode]) {
                modeContents[currentMode].classList.remove('hidden');
            }
            loadNewClockRound(); // Start a new round in the new mode
        }

        // --- Check Answer Logic (mode-aware) ---
        function checkTimeAnswer() {
            feedbackClock.textContent = ''; // Clear previous feedback

            if (currentMode === 'enter-time') {
                if (!timeInputHour || !timeInputMinute) {
                    console.error("Hour or minute input fields not found.");
                    return;
                }

                const userHour = parseInt(timeInputHour.value, 10);
                const userMinute = parseInt(timeInputMinute.value, 10);

                if (isNaN(userHour) || isNaN(userMinute)) {
                    feedbackClock.textContent = `❌ Please enter numbers for hour and minute.`;
                    feedbackClock.style.color = "orange";
                    playIncorrectSound();
                    return;
                }
                if (userHour < 1 || userHour > 12) {
                    feedbackClock.textContent = `❌ Hour must be between 1 and 12.`;
                    feedbackClock.style.color = "orange";
                    playIncorrectSound();
                    return;
                }
                if (userMinute < 0 || userMinute > 59) {
                    feedbackClock.textContent = `❌ Minute must be between 00 and 59.`;
                    feedbackClock.style.color = "orange";
                    playIncorrectSound();
                    return;
                }

                if (userHour === currentHour && userMinute === currentMinute) {
                    playSuccessSound();
                    feedbackClock.textContent = "✅ Correct! Well done!";
                    feedbackClock.style.color = "green";
                    setTimeout(loadNewClockRound, 1500);
                } else {
                    playIncorrectSound();
                    feedbackClock.textContent = `❌ Try again!`;
                    feedbackClock.style.color = "red";
                }
            } else if (currentMode === 'multiple-choice') {
                console.log("Check Answer button clicked in Multiple Choice mode. This mode uses direct button clicks on choices.");
                feedbackClock.textContent = "Please select an answer from the choices.";
                feedbackClock.style.color = "blue";
            } else if (currentMode === 'set-time') {
                // Read current hand positions for Set Time mode
                const minuteHandTransform = minuteHand.style.transform;
                const hourHandTransform = hourHand.style.transform;

                // Extract degrees from transform string (e.g., "translateX(-50%) rotate(180deg)")
                const currentMinuteDegrees = parseFloat(minuteHandTransform.match(/rotate\(([^)]+)deg\)/)[1]);
                const currentHourDegrees = parseFloat(hourHandTransform.match(/rotate\(([^)]+)deg\)/)[1]);

                // Convert degrees back to time
                const actualMinute = Math.round(currentMinuteDegrees / 6); // 0-59

                // Calculate the actual hour based on the hour hand's degrees
                let calculatedHourFloat = currentHourDegrees / 30;
                let actualHour = Math.round(calculatedHourFloat);
                if (actualHour === 0) actualHour = 12;

                let derivedHourFromHand = currentHourDegrees / 30;
                let derivedIntegerHour = Math.floor(derivedHourFromHand);
                if (derivedIntegerHour === 0) derivedIntegerHour = 12;

                let derivedMinuteFraction = (derivedHourFromHand - Math.floor(derivedIntegerHour)) * 60;
                let derivedMinuteFromHourHand = Math.round(derivedMinuteFraction);

                let finalActualHour = derivedIntegerHour;
                let finalActualMinute = actualMinute;

                // Compare with the target time (currentHour, currentMinute)
                const targetMinute = currentMinute;
                const targetHour = currentHour;

                const toleranceDegrees = 1.5;

                const targetMinuteDegrees = targetMinute * 6;
                const isMinuteCorrect = Math.abs(currentMinuteDegrees - targetMinuteDegrees) <= toleranceDegrees;

                const targetHourDegrees = (targetHour % 12) * 30 + (targetMinute * 0.5);
                const isHourCorrect = Math.abs(currentHourDegrees - targetHourDegrees) <= toleranceDegrees;

                if (isMinuteCorrect && isHourCorrect) {
                    playSuccessSound();
                    feedbackClock.textContent = "✅ Correct! Well done!";
                    feedbackClock.style.color = "green";
                    setTimeout(loadNewClockRound, 1500);
                } else {
                    playIncorrectSound();
                    feedbackClock.textContent = `❌ Try again! You set: ${formatTime(finalActualHour, finalActualMinute)}. Target: ${formatTime(targetHour, targetMinute)}`;
                    feedbackClock.style.color = "red";
                }
            }
        }


        // --- Event Listeners ---

        // Mode Radio Buttons
        modeRadioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                switchMode(this.value);
            });
        });

        // Check Answer Button (common for all modes, logic is inside checkTimeAnswer)
        if (checkTimeBtn) { checkTimeBtn.addEventListener('click', checkTimeAnswer); }

        // Next Time Button (common for all modes)
        if (nextTimeBtn) { nextTimeBtn.addEventListener('click', loadNewClockRound); }

        // Enter Time Input Fields
        if (timeInputHour) {
            timeInputHour.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') { checkTimeAnswer(); }
            });
            timeInputHour.addEventListener('input', function() {
                if (this.value.length === 2 && timeInputMinute) {
                    timeInputMinute.focus();
                }
                let val = parseInt(this.value, 10);
                if (val > 12) this.value = 12;
                if (val < 1 && this.value.length > 0) this.value = '';
            });
        }
        if (timeInputMinute) {
            timeInputMinute.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') { checkTimeAnswer(); }
            });
            timeInputMinute.addEventListener('input', function() {
                let val = parseInt(this.value, 10);
                if (val > 59) this.value = 59;
            });
        }

        // Difficulty Level Select
        if (difficultyLevelSelect) {
            difficultyLevelSelect.addEventListener('change', function() {
                currentDifficulty = parseInt(this.value);
                loadNewClockRound();
            });
        }

        // --- Set Time Mode Draggability (Minute Hand Only) ---
        let isDraggingMinuteHand = false;
        let clockRect;

        // REVISED DRAG STATE VARIABLES for robust accumulation
        let initialMinuteHandStartAngle = 0; // Angle of minute hand when drag starts (0-359)
        let initialHourHandStartAngle = 0;   // Angle of hour hand when drag starts (0-359)
        let accumulatedMinuteHandRotation = 0; // Total degrees minute hand has rotated since drag start (can be > 360 or < -360)


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

                const minuteHandTransformStyle = minuteHand.style.transform;
                const minMatch = minuteHandTransformStyle.match(/rotate\(([^)]+)deg\)/);
                if (minMatch && minMatch[1]) {
                    initialMinuteHandStartAngle = parseFloat(minMatch[1]);
                    initialMinuteHandStartAngle = (initialMinuteHandStartAngle % 360 + 360) % 360;
                } else {
                    initialMinuteHandStartAngle = 0;
                }

                const hourHandTransformStyle = hourHand.style.transform;
                const hourMatch = hourHandTransformStyle.match(/rotate\(([^)]+)deg\)/);
                if (hourMatch && hourMatch[1]) {
                    initialHourHandStartAngle = parseFloat(hourMatch[1]);
                    initialHourHandStartAngle = (initialHourHandStartAngle % 360 + 360) % 360;
                } else {
                    initialHourHandStartAngle = 0;
                }

                accumulatedMinuteHandRotation = 0; // Reset accumulated rotation for this new drag operation

                // console.log("Drag Started: Initial Min Angle:", initialMinuteHandStartAngle, "Initial Hour Angle:", initialHourHandAngle); // DEBUG
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

                let lastKnownMinuteAngle = parseFloat(minuteHand.style.transform.match(/rotate\(([^)]+)deg\)/)[1]);
                if (isNaN(lastKnownMinuteAngle)) lastKnownMinuteAngle = 0;
                lastKnownMinuteAngle = (lastKnownMinuteAngle % 360 + 360) % 360;

                let angleDeltaForAccumulation = snappedCurrentMouseAngleDegrees - lastKnownMinuteAngle;

                if (angleDeltaForAccumulation > 180) {
                    angleDeltaForAccumulation -= 360;
                } else if (angleDeltaForAccumulation < -180) {
                    angleDeltaForAccumulation += 360;
                }

                accumulatedMinuteHandRotation += angleDeltaForAccumulation;

                const newMinuteHandDegrees = (initialMinuteHandStartAngle + accumulatedMinuteHandRotation);
                minuteHand.style.transform = `translateX(-50%) rotate(${newMinuteHandDegrees % 360}deg)`;

                const hourAngleChangeFromAccumulation = accumulatedMinuteHandRotation / 12;

                const newHourHandDegrees = (initialHourHandStartAngle + hourAngleChangeFromAccumulation);
                hourHand.style.transform = `translateX(-50%) rotate(${newHourHandDegrees % 360}deg)`;

                // --- DEBUGGING LOGS (ONLY ENABLE WHEN NEEDED) ---
                // console.log(`DRAG: Mouse: (${clientX}, ${clientY})`);
                // console.log(`DRAG: Current Mouse Angle (0-360): ${currentMouseAngleDegrees.toFixed(2)}`);
                // console.log(`DRAG: Snapped Minute Degrees: ${snappedCurrentMouseAngleDegrees}`);
                // console.log(`DRAG: lastKnownMinuteAngle (before delta): ${lastKnownMinuteAngle}`);
                // console.log(`DRAG: Angle Delta for Accumulation: ${angleDeltaForAccumulation}`);
                // console.log(`DRAG: Accumulated Minute Rotation: ${accumulatedMinuteHandRotation}`);
                // console.log(`DRAG: New Minute Hand Degrees (applied): ${newMinuteHandDegrees.toFixed(2)}`);
                // console.log(`DRAG: Hour Angle Change (from accum): ${hourAngleChangeFromAccumulation.toFixed(2)}`);
                // console.log(`DRAG: New Hour Hand Degrees (applied): ${newHourHandDegrees.toFixed(2)}`);
                // console.log(`DRAG: Actual Hour Hand Transform: ${hourHand.style.transform}`);
                // --- END DEBUGGING LOGS ---
            };

            const endDrag = () => {
                isDraggingMinuteHand = false;
                minuteHand.style.zIndex = '5';
                hourHand.style.zIndex = '5';
                // console.log("Drag ended."); // DEBUG
            };

            minuteHand.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', endDrag);

            minuteHand.addEventListener('touchstart', startDrag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('touchend', endDrag);
        } else {
            console.warn("Minute hand or clock display or hour hand element not found for drag functionality.");
        }


        // --- Initial Setup ---
        drawClockNumbersAndTicks();
        switchMode(currentMode);
    }
});