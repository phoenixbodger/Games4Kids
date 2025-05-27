// script.js

// --- Utility Functions (These can be defined globally, outside specific DOMContentLoaded handlers) ---
// These functions don't directly interact with the DOM upon definition, so they can be global.

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

// This setupGame is for the word-matching game
async function setupGame() {
    const words = await loadWords();
    if (words.length === 0) {
        console.error("No words loaded—check words.json!");
        return { correctWord: null, wordChoices: [] };
    }

    // Pick a random correct word FIRST
    const correctWord = words[Math.floor(Math.random() * words.length)];

    const imageElement = document.querySelector('.image'); // .image is from word-match.html
    if (imageElement) { // Defensive check
        imageElement.src = `images/${correctWord.toLowerCase()}.png`;
        imageElement.id = `images/${correctWord.toLowerCase()}Target`;
    } else {
        console.warn("'.image' element not found for word-match.html setup.");
    }

    // Select two random incorrect words (excluding correct word)
    const incorrectWords = words.filter(word => word !== correctWord).sort(() => Math.random() - 0.5).slice(0, 2);

    // Display all 3 words (correct + 2 incorrect)
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

// Utility function for Type Animal Game and Clock Game (for scrambling words if needed)
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

            console.log("Selected word:", selectedWord);
            console.log("Correct word:", correctWord);

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

        // Event Listeners for Type Animal Game
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
    if (clockDisplay) {

        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        // **** MODIFIED: New input elements ****
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        // **** END MODIFIED ****
        const checkTimeBtn = document.getElementById('check-time-btn');
        const nextTimeBtn = document.getElementById('next-time-btn');
        const feedbackClock = document.getElementById('feedback-clock');
        const difficultyLevelSelect = document.getElementById('difficulty-level');

        let currentHour, currentMinute;
        let currentDifficulty = 4;
        if (difficultyLevelSelect) {
            currentDifficulty = parseInt(difficultyLevelSelect.value);
        } else {
            console.warn("Difficulty level select element not found. Defaulting to Level 4.");
        }

        // --- Function to Draw Clock Numbers and Ticks ---
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
        // --- END drawClockNumbersAndTicks ---


        // --- MODIFIED generateRandomTime to incorporate levels ---
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
        // --- END MODIFIED generateRandomTime ---

        function setClockHands(hour, minute) {
            const hourDegrees = (hour % 12) * 30 + (minute * 0.5);
            hourHand.style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;

            const minuteDegrees = minute * 6;
            minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
        }

        function loadNewClockRound() {
            const { hour, minute } = generateRandomTime();
            setClockHands(hour, minute);
            // **** MODIFIED: Clear both input fields ****
            if (hourInput) hourInput.value = '';
            if (minuteInput) minuteInput.value = '';
            // **** END MODIFIED ****
            feedbackClock.textContent = '';
            feedbackClock.style.color = '#333';
        }

                // --- MODIFIED checkTimeAnswer ---
        function checkTimeAnswer() {
            if (!hourInput || !minuteInput) {
                console.error("Hour or minute input fields not found.");
                return;
            }

            // Get user input as numbers, default to 0 if empty
            const userHour = parseInt(hourInput.value, 10);
            const userMinute = parseInt(minuteInput.value, 10);

            // Basic validation for numbers
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

            // Compare with the actual current time (currentHour, currentMinute)
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
        }
        // --- END MODIFIED checkTimeAnswer ---


        // Event Listeners for Clock Game
        if (checkTimeBtn) { checkTimeBtn.addEventListener('click', checkTimeAnswer); }
        if (nextTimeBtn) { nextTimeBtn.addEventListener('click', loadNewClockRound); }
        // **** MODIFIED: Add keypress listeners to both new input fields ****
        if (hourInput) {
            hourInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    checkTimeAnswer();
                }
            });
            // Optional: Auto-focus on minute input after 2 digits in hour
            hourInput.addEventListener('input', function() {
                if (this.value.length === 2 && minuteInput) {
                    minuteInput.focus();
                }
            });
        }
        if (minuteInput) {
            minuteInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    checkTimeAnswer();
                }
            });
        }
        // **** END MODIFIED ****


        if (difficultyLevelSelect) {
            difficultyLevelSelect.addEventListener('change', function() {
                currentDifficulty = parseInt(this.value);
                loadNewClockRound();
            });
        }

        // Initialize the clock game when the page loads
        drawClockNumbersAndTicks();
        loadNewClockRound();
    } // End of if (clockDisplay)
}); // END of the single DOMContentLoaded listener