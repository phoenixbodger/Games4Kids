// mad-libs-game.js
document.addEventListener('DOMContentLoaded', function() {
    const madLibsContainer = document.querySelector('.mad-libs-container');
    if (!madLibsContainer) return; // Only run on the Mad Libs page

    // --- Get DOM Elements ---
    const selectionScreen = document.getElementById('mad-libs-selection-screen');
    const storySelect = document.getElementById('story-select');
    const startBtn = document.getElementById('start-mad-libs-btn');

    const inputScreen = document.getElementById('mad-libs-input-screen');
    const inputScreenTitle = document.getElementById('input-screen-title');
    const madLibsForm = document.getElementById('mad-libs-form');
    const createStoryBtn = document.getElementById('create-story-btn');

    const storyScreen = document.getElementById('mad-libs-story-screen');
    const storyTitle = document.getElementById('story-title');
    const finalStory = document.getElementById('final-story');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- Game State ---
    let stories = [];
    let currentStory;

    // --- Functions ---

    async function loadStories() {
        try {
            const response = await fetch('mad-libs-stories.json');
            if (!response.ok) throw new Error('Failed to load stories.');
            const data = await response.json();
            stories = data.stories;
            populateStorySelector();
        } catch (error) {
            console.error('Error loading Mad Libs stories:', error);
            storySelect.innerHTML = '<option value="">Could not load stories</option>';
        }
    }

    function populateStorySelector() {
        storySelect.innerHTML = '<option value="">-- Select a Story --</option>';
        stories.forEach((story, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = story.title;
            storySelect.appendChild(option);
        });
    }

    function showInputScreen() {
        const storyIndex = storySelect.value;
        if (storyIndex === '') return;

        currentStory = stories[storyIndex];
        selectionScreen.classList.add('hidden');
        storyScreen.classList.add('hidden');
        inputScreen.classList.remove('hidden');

        inputScreenTitle.textContent = `"${currentStory.title}" - Fill in the words!`;
        madLibsForm.innerHTML = ''; // Clear previous form

        currentStory.blanks.forEach((blank, index) => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'mad-libs-input-group';
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = blank;
            input.required = true;
            input.id = `blank-${index}`;
            inputGroup.appendChild(input);
            madLibsForm.appendChild(inputGroup);
        });
        madLibsForm.querySelector('input').focus();
    }

    function generateStory(event) {
        event.preventDefault(); // Prevent form from submitting
        const userWords = [];
        let allFilled = true;
        currentStory.blanks.forEach((_, index) => {
            const input = document.getElementById(`blank-${index}`);
            if (!input.value.trim()) {
                allFilled = false;
            }
            userWords.push(input.value.trim());
        });

        if (!allFilled) {
            alert('Please fill in all the blanks!');
            return;
        }

        let storyText = currentStory.template;
        userWords.forEach((word, index) => {
            storyText = storyText.replace(`{${index}}`, `<strong>${word}</strong>`);
        });

        storyTitle.textContent = currentStory.title;
        finalStory.innerHTML = storyText;

        inputScreen.classList.add('hidden');
        storyScreen.classList.remove('hidden');
    }

    function resetGame() {
        storyScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
    }

    // --- Event Listeners ---
    storySelect.addEventListener('change', () => startBtn.disabled = storySelect.value === '');
    startBtn.addEventListener('click', showInputScreen);
    createStoryBtn.addEventListener('click', generateStory);
    playAgainBtn.addEventListener('click', resetGame);

    // --- Initial Load ---
    loadStories();
});
