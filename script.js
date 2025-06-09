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
    const isOnClockGamePage = !!document.querySelector('.clock-display'); // Check if we are on clock game page
    if (mainButton) {
        if (!isOnClockGamePage) { // If NOT on clock game page, then add the global "go to index"
            mainButton.addEventListener('click', function() {
                window.location.href = 'index.html';
            });
        }
        // If on clock game page, its specific handler is attached later
        // in the clock game's own if (clockDisplay) block.
    }

    

}); // END of the single DOMContentLoaded listener
                   