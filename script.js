// script.js

// --- Utility Functions (can be defined globally, outside specific DOMContentLoaded handlers) ---
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
    const correctWord = words[Math.floor(Math.random() * words.length)]; // MOVED THIS LINE UP!


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

// Utility function for Type Animal Game
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
    // Check for an element unique to word-match.html, e.g., the word container
        const wordContainer = document.querySelector('.words');
    if (wordContainer) {

        // Define initWordGame inside this scope so checkAnswer can call it
        // This makes them accessible to each other

        // checkAnswer for the word-matching game
        function checkAnswer(selectedWord, correctWord) {
            const feedbackElement = document.getElementById('feedback'); // #feedback is from word-match.html
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
                
                // --- ADD THIS BLOCK FOR THE DELAY AND NEXT WORD ---
                setTimeout(async () => { // Use async if setupGame is async
                    feedbackElement.textContent = ""; // Clear feedback
                    const wordContainer = document.querySelector('.words');
                    if (wordContainer) {
                        wordContainer.innerHTML = ""; // Clear previous words
                    }
                    // Call initWordGame to load the next word/round
                    // Assuming initWordGame is accessible here or you pass it
                    // If initWordGame is in the DOMContentLoaded scope, you'll need to call it from there.
                    // A more robust way is to factor out the "load new round" logic into a separate function.
                    await initWordGame(); // Call the function to load the next round
                }, 1500); // 1500 milliseconds = 1.5 seconds delay
                // ----------------------------------------------------

            } else {
                playIncorrectSound();
                feedbackElement.textContent = "❌ TRY AGAIN!";
                feedbackElement.style.color = "red";
            }
        }

        // initWordGame is also defined within this scope
        async function initWordGame() {
            const { correctWord, wordChoices } = await setupGame();
            const feedbackElement = document.getElementById('feedback'); // Get it here

            wordContainer.innerHTML = ''; // Clear previous words

            wordChoices.forEach(word => {
                const wordDiv = document.createElement('div');
                wordDiv.classList.add('word');
                wordDiv.textContent = word.toUpperCase();
                wordDiv.id = word.toLowerCase();

                wordDiv.addEventListener('click', function() {
                    checkAnswer(wordDiv.id, correctWord); // checkAnswer now triggers next round
                });
                wordContainer.appendChild(wordDiv);
            });
        }
        initWordGame(); // Call to initialize the first round

        // Next Button for word-match.html (You might not need this button anymore if it auto-advances)
        // If you still want a "Next" button for manual advancement, keep this,
        // otherwise, you can remove it.
        const nextButton = document.getElementById('next-btn');
        if (nextButton) {
            nextButton.addEventListener('click', async () => {
                const feedbackElement = document.getElementById('feedback');
                if (feedbackElement) feedbackElement.textContent = "";
                await initWordGame(); // Re-initialize game for next round
            });
        } else {
             console.warn("#next-btn not found on word-match.html.");
        }
    }


    // --- Type the Animal Name Game (type-animal-game.html) Specific Logic ---
    const animalInput = document.getElementById('animal-input');

    if (animalInput) { // If animalInput exists, we are on type-animal-game.html
        const animalImg = document.getElementById('animal-img');
        const checkBtn = document.getElementById('check-btn');
        const hintBtn = document.getElementById('hint-btn');
        const hintDisplay = document.getElementById('hint-display');
        const messageDisplay = document.getElementById('message');

        // We will load the 'animals' data from words.json
        let animals = []; // This will store the words from words.json

        let currentAnimalName = ''; // Stores the correct word string
        // No need for currentAnimalIndex or currentAnimal object if words.json is just a list of strings

        // Function to initialize or re-load a round for the Type Animal Game
        async function loadNewAnimalRound() {
            const allWords = await loadWords(); // Use your existing loadWords function
            if (allWords.length === 0) {
                messageDisplay.textContent = "Error: No words loaded for animals!";
                return;
            }
            animals = allWords; // Assign the loaded words to the 'animals' array

            // Pick a random animal name from the loaded words
            currentAnimalName = animals[Math.floor(Math.random() * animals.length)].toLowerCase();

            // Set the image source based on the selected animal name
            if (animalImg) {
                // Assuming your image files are named like 'dog.png', 'cat.png', etc.
                animalImg.src = `images/${currentAnimalName}.png`;
            } else {
                console.warn("Animal image element not found on type-animal-game.html.");
            }

            animalInput.value = ''; // Clear input
            hintDisplay.textContent = ''; // Clear hint
            messageDisplay.textContent = ''; // Clear message
            hintBtn.style.display = 'inline-block'; // Ensure hint button is visible
        }

        function typeAnimalCheckAnswer() {
            const userAnswer = animalInput.value.trim().toLowerCase();

            if (userAnswer === currentAnimalName) { // Compare with currentAnimalName
                playSuccessSound();
                messageDisplay.textContent = "Correct! Well done!";
                messageDisplay.style.color = "green";
                setTimeout(loadNewAnimalRound, 1500); // Load new round
            } else {
                playIncorrectSound();
                messageDisplay.textContent = "Try again!";
                messageDisplay.style.color = "red";
            }
        }

        function provideHint() {
            const word = currentAnimalName; // Use currentAnimalName directly
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

        // Initialize the game round when the page loads
        loadNewAnimalRound(); // Call this to start the game
    }
}); // END of the single DOMContentLoaded listener