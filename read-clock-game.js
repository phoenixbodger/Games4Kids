// read-clock-game.js
document.addEventListener('DOMContentLoaded', function() {
    const clockDisplay = document.querySelector('.clock-display');
    if (clockDisplay) { // Check if we are on the clock game page
        const mainButton = document.getElementById('main-btn'); // Get main button for this page

        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const timeInputHour = document.getElementById('hour-input'); 
        const timeInputMinute = document.getElementById('minute-input'); 

        const checkTimeBtnEnter = document.getElementById('check-time-btn');
        const nextTimeBtnEnter = document.getElementById('next-time-btn');

        const checkTimeBtnSet = document.getElementById('check-time-btn-set');
        const nextTimeBtnSet = document.getElementById('next-time-btn-set');

        const feedbackClock = document.getElementById('feedback-clock');
        const difficultyLevelSelect = document.getElementById('difficulty-level');

        const modeRadioButtons = document.querySelectorAll('input[name="game-mode"]');
        const modeContents = {
            'multiple-choice': document.getElementById('mode-multiple-choice-content'),
            'enter-time': document.getElementById('mode-enter-time-content'),
            'set-time': document.getElementById('mode-set-time-content')
        };
        const targetSetTimeText = document.getElementById('target-set-time-text');

        const timerSetting = document.getElementById('timer-setting');
        const clockTimerCustomInput = document.getElementById('clock-timer-custom'); 
        const roundsSetting = document.getElementById('rounds-setting');
        const clockRoundsCustomInput = document.getElementById('clock-rounds-custom'); 
        const startGameBtn = document.getElementById('start-game-btn');
        const clockGameInfo = document.querySelector('.clock-game-container .game-info');
        const timerDisplay = document.getElementById('timer-display');
        const roundDisplay = document.getElementById('round-display');
        const scoreDisplayClock = document.getElementById('score-display-clock'); 
        const gameSettings = document.querySelector('.clock-game-container .game-settings');

        let currentDifficulty = parseInt(difficultyLevelSelect.value);
        let correctHour, correctMinute;
        let currentMode = document.querySelector('input[name="game-mode"]:checked').value;

        let timerInterval;
        let timeLeft;
        let totalRoundsClock;
        let currentRoundClock = 0;
        let correctAnswersClock = 0;
        let totalQuestionsAttemptedClock = 0;
        let clockMcIncorrectAttempts = 0; 
        let clockEnterTimeIncorrectAttempts = 0; 
        let clockSetTimeIncorrectAttempts = 0; 

        function hideAllModeContent() {
            if (modeContents['multiple-choice']) modeContents['multiple-choice'].classList.add('hidden');
            if (modeContents['enter-time']) modeContents['enter-time'].classList.add('hidden');
            if (modeContents['set-time']) modeContents['set-time'].classList.add('hidden');
        }

        function switchMode(mode) {
            hideAllModeContent(); 
            if (modeContents[mode]) modeContents[mode].classList.remove('hidden'); 

            if (mode === 'multiple-choice') {
                if (document.querySelector('#mode-enter-time-content')) { 
                    const inputGroup = document.querySelector('#mode-enter-time-content .time-input-group');
                    const controls = document.querySelector('#mode-enter-time-content .controls');
                    if (inputGroup) inputGroup.classList.add('hidden');
                    if (controls) controls.classList.add('hidden');
                }
                if (document.querySelector('#mode-set-time-content')) { 
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
            loadNewClockRound();
        }

        function startClockGame() {
            currentDifficulty = parseInt(difficultyLevelSelect.value);
            currentMode = document.querySelector('input[name="game-mode"]:checked').value;
            if (roundsSetting.value === 'custom') {
                const customRounds = parseInt(clockRoundsCustomInput.value);
                totalRoundsClock = (customRounds > 0 && customRounds <= 100) ? customRounds.toString() : '5'; 
            } else {
                totalRoundsClock = roundsSetting.value;
            }
            timeLeft = parseInt(timerSetting.value); 
            currentRoundClock = 0; 
            correctAnswersClock = 0; 
            totalQuestionsAttemptedClock = 0; 

            gameSettings.classList.add('hidden'); 
            clockGameInfo.classList.remove('hidden'); 
            clockDisplay.classList.remove('hidden'); 

            switchMode(currentMode); 
            updateClockScorecard(); 
        }

        function startTimer() {
            stopTimer(); 
            let timerDurationValue = timerSetting.value;
            let actualDurationSeconds;

            if (timerDurationValue === 'custom') {
                const customSeconds = parseInt(clockTimerCustomInput.value);
                actualDurationSeconds = (customSeconds > 0 && customSeconds <= 300) ? customSeconds : 0; 
            } else if (timerDurationValue === 'off') {
                actualDurationSeconds = 0;
            } else {
                actualDurationSeconds = parseInt(timerDurationValue);
            }

            if (actualDurationSeconds <= 0) { 
                timerDisplay.textContent = 'Time: -s';
                return;
            }

            timeLeft = actualDurationSeconds;
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
            playIncorrectSound(); // Assumes playIncorrectSound is global (from script.js)
            updateClockScorecard();
            setTimeout(loadNewClockRound, 2000);
        }

        function updateClockScorecard() {        
            roundDisplay.textContent = `Round: ${currentRoundClock} / ${totalRoundsClock}`;
            scoreDisplayClock.textContent = `Score: ${correctAnswersClock}`; 
        }

        function endClockGame() {
            stopTimer(); 
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

        function generateRandomTime(difficulty) {
            let hour = Math.floor(Math.random() * 12) + 1;
            let minute;
            let possibleMinutes = [];
            switch (difficulty) {
                case 1: possibleMinutes = [0]; break;
                case 2: possibleMinutes = [0, 30]; break;
                case 3: possibleMinutes = [0, 15, 30, 45]; break;
                case 4: for (let i = 0; i < 60; i += 5) possibleMinutes.push(i); break;
                case 5: for (let i = 0; i < 60; i++) possibleMinutes.push(i); break;
                default:
                    for (let i = 0; i < 60; i += 5) possibleMinutes.push(i);
                    console.warn("Invalid difficulty level, defaulting to 5-minute intervals.");
            }
            minute = possibleMinutes[Math.floor(Math.random() * possibleMinutes.length)];
            return { hour, minute };
        }

        function setClockHands(hour, minute) {
            const actualHourForCalc = hour % 12; 
            const hourDegrees = (actualHourForCalc * 30) + (minute * 0.5); 
            if (hourHand) {
                 hourHand.style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;
            }
            const minuteDegrees = minute * 6; 
            if (minuteHand) {
                 minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
            }
        }
        
        function formatTime(h, m) {
            const formattedM = m < 10 ? `0${m}` : m;
            return `${h}:${formattedM}`;
        }

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
                if (Math.abs(randomHour - correctHour) < 2 && Math.abs(randomMinute - correctMinute) < 15 && randomMinute !== correctMinute) continue;
                if (randomHour === correctHour && randomMinute === correctMinute) continue;
                choices.add(formatTime(randomHour, randomMinute));
            }
            return shuffleArray(Array.from(choices)); // Assumes shuffleArray is global
        }

        function drawClockNumbersAndTicks() {
            if (!clockDisplay) {
                console.warn("Clock display not found, cannot draw numbers and ticks.");
                return;
            }
            clockDisplay.querySelectorAll('.clock-number, .minute-tick, .hour-tick').forEach(el => el.remove());
            const radius = clockDisplay.clientWidth / 2; 
            const inset = 10; 
            const tickRadius = radius - inset; 
            const numberRadius = radius - 25; 

            for (let i = 0; i < 60; i++) {
                const angleDeg = i * 6 - 90; 
                const angleRad = angleDeg * Math.PI / 180;
                const x = radius + tickRadius * Math.cos(angleRad);
                const y = radius + tickRadius * Math.sin(angleRad);
                const tick = document.createElement('div');
                tick.classList.add(i % 5 === 0 ? 'hour-tick' : 'minute-tick');
                tick.style.left = `${x}px`;
                tick.style.top = `${y}px`;
                tick.style.transform = `translate(-50%, -50%) rotate(${angleDeg + 90}deg)`; 
                clockDisplay.appendChild(tick);
            }

            for (let i = 1; i <= 12; i++) {
                const angleDeg = i * 30 - 90; 
                const angleRad = angleDeg * Math.PI / 180;
                const x = radius + numberRadius * Math.cos(angleRad);
                const y = radius + numberRadius * Math.sin(angleRad);
                const num = document.createElement('div');
                num.classList.add('clock-number');
                num.style.left = `${x}px`;
                num.style.top = `${y}px`;
                num.textContent = i;
                num.style.transform = 'translate(-50%, -50%)'; 
                clockDisplay.appendChild(num);
            }
        }

        function loadNewClockRound() {
            stopTimer();
            currentRoundClock++;
            totalQuestionsAttemptedClock++;

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
                angle = (angle % 360 + 360) % 360; 
                return angle;
            }
            return 0;
        }

        if (minuteHand && clockDisplay && hourHand) {
            const startDrag = (e) => {
                if (currentMode !== 'set-time') return;
                isDraggingMinuteHand = true;
                clockRect = clockDisplay.getBoundingClientRect();
                if (e.type === 'touchstart') e.preventDefault();
                minuteHand.style.zIndex = '11';
                hourHand.style.zIndex = '10';
                initialMinuteHandStartAngle = getRotationDegrees(minuteHand);
                initialHourHandStartAngle = getRotationDegrees(hourHand);
                accumulatedMinuteHandRotation = 0;
            };

            const drag = (e) => {
                if (!isDraggingMinuteHand) return;
                if (e.type === 'touchmove') e.preventDefault();
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
                if (angleDeltaForAccumulation > 180) angleDeltaForAccumulation -= 360;
                else if (angleDeltaForAccumulation < -180) angleDeltaForAccumulation += 360;
                accumulatedMinuteHandRotation += angleDeltaForAccumulation;
                const newMinuteHandDegrees = (initialMinuteHandStartAngle + accumulatedMinuteHandRotation + 36000) % 360;
                minuteHand.style.transform = `translateX(-50%) rotate(${newMinuteHandDegrees}deg)`;
                const newHourHandDegrees = (initialHourHandStartAngle + (accumulatedMinuteHandRotation / 12) + 36000) % 360;
                hourHand.style.transform = `translateX(-50%) rotate(${newHourHandDegrees}deg)`;
            };

            const endDrag = () => {
                isDraggingMinuteHand = false;
                minuteHand.style.zIndex = '5';
                hourHand.style.zIndex = '5';
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
        
        function checkEnterTimeAnswer() { 
            stopTimer(); 
            const enteredHour = parseInt(timeInputHour.value);
            const enteredMinute = parseInt(timeInputMinute.value);

            if (isNaN(enteredHour) || isNaN(enteredMinute) || enteredHour < 1 || enteredHour > 12 || enteredMinute < 0 || enteredMinute > 59) {
                feedbackClock.textContent = 'Invalid time. Use HH:MM (e.g., 3:05, 12:40).';
                feedbackClock.style.color = 'red';
                playIncorrectSound(); // Assumes playIncorrectSound is global
                return;
            }

            const formattedCorrectTime = formatTime(correctHour, correctMinute);
            const formattedEnteredTime = formatTime(enteredHour, enteredMinute);

            if (enteredHour === correctHour && enteredMinute === correctMinute) {
                playSuccessSound(); // Assumes playSuccessSound is global
                feedbackClock.textContent = `✅ Correct! It's ${formattedCorrectTime}.`;
                feedbackClock.style.color = 'green';
                correctAnswersClock++; // Increment score here for Enter Time mode
                updateClockScorecard();
                setTimeout(loadNewClockRound, 1500);
            } else {
                clockEnterTimeIncorrectAttempts++;
                playIncorrectSound(); // Assumes playIncorrectSound is global
                if (clockEnterTimeIncorrectAttempts >= 2) {
                    feedbackClock.textContent = `❌ Incorrect. You entered ${formattedEnteredTime}. The correct time was ${formattedCorrectTime}.`;
                    feedbackClock.style.color = 'red';
                    updateClockScorecard(); 
                    setTimeout(loadNewClockRound, 2000); 
                } else {
                    feedbackClock.textContent = `❌ TRY AGAIN! (1 attempt left)`;
                    feedbackClock.style.color = 'red';
                    timeInputHour.focus(); 
                }
            }
        }

        function checkMultipleChoiceAnswer(clickedButton, chosenTime) {
            stopTimer();
            const formattedCorrectTime = formatTime(correctHour, correctMinute);
            const mcChoiceButtons = document.querySelectorAll('#mode-multiple-choice-content .choice-button');

            if (chosenTime === formattedCorrectTime) {
                playSuccessSound(); // Assumes playSuccessSound is global
                feedbackClock.textContent = `✅ Correct! It's ${formattedCorrectTime}.`;
                feedbackClock.style.color = 'green';
                clickedButton.classList.add('correct');
                correctAnswersClock++;
                updateClockScorecard();
                mcChoiceButtons.forEach(button => button.disabled = true); 
                setTimeout(loadNewClockRound, 2000);
            } else {
                clockMcIncorrectAttempts++; 
                playIncorrectSound(); // Assumes playIncorrectSound is global
                clickedButton.classList.add('incorrect');

                if (clockMcIncorrectAttempts >= 2) {
                    feedbackClock.textContent = `❌ Incorrect. The correct time was ${formattedCorrectTime}.`;
                    feedbackClock.style.color = 'red';
                    mcChoiceButtons.forEach(button => {
                        if (button.textContent === formattedCorrectTime) button.classList.add('correct'); 
                        button.disabled = true; 
                    });
                    updateClockScorecard();
                    setTimeout(loadNewClockRound, 2000);
                } else {
                    feedbackClock.textContent = `❌ TRY AGAIN! (1 attempt left)`;
                    feedbackClock.style.color = 'red';
                    clickedButton.disabled = true; 
                }
            }
        }

        function checkSetTimeAnswer() {
            stopTimer();
            const formattedCorrectTime = formatTime(correctHour, correctMinute);
            const currentMinuteDegrees = getRotationDegrees(minuteHand);
            const currentHourDegrees = getRotationDegrees(hourHand);
            const actualMinute = Math.round(currentMinuteDegrees / 6);
            let hourAngleWithoutMinuteInfluence = (currentHourDegrees - (actualMinute * 0.5));
            hourAngleWithoutMinuteInfluence = (hourAngleWithoutMinuteInfluence % 360 + 360) % 360;
            let actualHour = Math.round(hourAngleWithoutMinuteInfluence / 30); 
            if (actualHour === 0) actualHour = 12; 
            const formattedSetTime = formatTime(actualHour, actualMinute);

            const toleranceMinutes = 0.5; 
            const toleranceDegrees = toleranceMinutes * 6; 
            const targetMinuteDegrees = correctMinute * 6;
            const targetHourDegrees = (correctHour % 12) * 30 + (correctMinute * 0.5);

            const isMinuteCorrect = Math.abs(currentMinuteDegrees - targetMinuteDegrees) <= toleranceDegrees ||
                                    Math.abs(currentMinuteDegrees - (targetMinuteDegrees + 360)) <= toleranceDegrees || 
                                    Math.abs(currentMinuteDegrees - (targetMinuteDegrees - 360)) <= toleranceDegrees;
            const isHourCorrect = Math.abs(currentHourDegrees - targetHourDegrees) <= toleranceDegrees ||
                                  Math.abs(currentHourDegrees - (targetHourDegrees + 360)) <= toleranceDegrees ||
                                  Math.abs(currentHourDegrees - (targetHourDegrees - 360)) <= toleranceDegrees;

            if (isMinuteCorrect && isHourCorrect) {
                playSuccessSound(); // Assumes playSuccessSound is global
                feedbackClock.textContent = `✅ Correct! You set it to ${formattedSetTime}.`;
                feedbackClock.style.color = 'green';
                correctAnswersClock++;
                updateClockScorecard();
                setTimeout(loadNewClockRound, 2000);
            } else {
                playIncorrectSound(); // Assumes playIncorrectSound is global
                clockSetTimeIncorrectAttempts++;
                if (clockSetTimeIncorrectAttempts >= 2) {
                    feedbackClock.textContent = `❌ Incorrect. You set ${formattedSetTime}. The correct time was ${formattedCorrectTime}.`;
                    feedbackClock.style.color = 'red';
                    updateClockScorecard(); 
                    setTimeout(loadNewClockRound, 2000); 
                } else {
                    feedbackClock.textContent = `❌ TRY AGAIN! (1 attempt left)`;
                    feedbackClock.style.color = 'red';
                }
            }
        }

        if (checkTimeBtnEnter) checkTimeBtnEnter.addEventListener('click', checkEnterTimeAnswer); 
        if (nextTimeBtnEnter) nextTimeBtnEnter.addEventListener('click', loadNewClockRound); 
        if (checkTimeBtnSet) checkTimeBtnSet.addEventListener('click', checkSetTimeAnswer); 
        if (nextTimeBtnSet) nextTimeBtnSet.addEventListener('click', loadNewClockRound); 

        if (timeInputHour && timeInputMinute) {
            timeInputHour.addEventListener('input', function(event) { 
                let val = event.target.value.replace(/\D/g, '');
                if (val.length === 2 && timeInputMinute) timeInputMinute.focus();
                if (parseInt(val, 10) > 12) event.target.value = 12;
                if (parseInt(val, 10) < 1 && val.length > 0) event.target.value = 1; 
            });
            timeInputMinute.addEventListener('input', function(event) {
                let val = event.target.value.replace(/\D/g, '');
                if (parseInt(val, 10) > 59) event.target.value = 59;
            });
        }

        modeRadioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                currentMode = this.value;
                switchMode(currentMode);
            });
        });

        if (difficultyLevelSelect) {
            difficultyLevelSelect.addEventListener('change', function() {
                currentDifficulty = parseInt(this.value);
                loadNewClockRound();
            });
        }

        if (timerSetting) {
            timerSetting.addEventListener('change', function() { 
                clockTimerCustomInput.classList.toggle('hidden', this.value !== 'custom');
                if (this.value === 'custom') clockTimerCustomInput.focus();
            }); 
        }
        if (roundsSetting) {
            roundsSetting.addEventListener('change', function() { 
                clockRoundsCustomInput.classList.toggle('hidden', this.value !== 'custom');
                if (this.value === 'custom') clockRoundsCustomInput.focus();
            });
        }

        startGameBtn.addEventListener('click', startClockGame);

        if (mainButton) { 
            mainButton.addEventListener('click', function() { 
                const isSettingsVisible = gameSettings && !gameSettings.classList.contains('hidden');
                if (isSettingsVisible) {
                    window.location.href = 'index.html';
                } else {
                    stopTimer(); 
                    gameSettings.classList.remove('hidden');
                    clockGameInfo.classList.add('hidden');
                    hideAllModeContent();
                    clockDisplay.classList.add('hidden'); 
                    if (feedbackClock) feedbackClock.textContent = '';
                    if (document.querySelector('#mode-enter-time-content .time-input-group')) document.querySelector('#mode-enter-time-content .time-input-group').classList.add('hidden');
                    if (document.querySelector('#mode-enter-time-content .controls')) document.querySelector('#mode-enter-time-content .controls').classList.add('hidden');
                    if (document.querySelector('#mode-set-time-content .controls')) document.querySelector('#mode-set-time-content .controls').classList.add('hidden');
                }
            });
        }

        gameSettings.classList.remove('hidden');
        clockGameInfo.classList.add('hidden');
        hideAllModeContent();
        if (document.querySelector('#mode-enter-time-content .time-input-group')) document.querySelector('#mode-enter-time-content .time-input-group').classList.add('hidden');
        if (document.querySelector('#mode-enter-time-content .controls')) document.querySelector('#mode-enter-time-content .controls').classList.add('hidden');
        if (document.querySelector('#mode-set-time-content .controls')) document.querySelector('#mode-set-time-content .controls').classList.add('hidden');

        drawClockNumbersAndTicks(); 
    } 
});