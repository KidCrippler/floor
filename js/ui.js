// UI Controller - handles all DOM manipulation and rendering

const UI = (function() {
    'use strict';

    // DOM elements
    let elements = {};

    // Initialize UI
    function init() {
        // Cache DOM elements
        elements = {
            // Timers
            timerRight: document.getElementById('timerRight'),
            timerLeft: document.getElementById('timerLeft'),
            timeRight: document.getElementById('timeRight'),
            timeLeft: document.getElementById('timeLeft'),
            labelRight: document.getElementById('labelRight'),
            labelLeft: document.getElementById('labelLeft'),

            // Question
            questionContent: document.getElementById('questionContent'),
            questionContainer: document.querySelector('.question-container'),

            // Answer overlay
            answerOverlay: document.getElementById('answerOverlay'),
            answerContent: document.getElementById('answerContent'),

            // Info bar
            categoryDisplay: document.getElementById('categoryDisplay'),

            // Pause menu
            pauseMenu: document.getElementById('pauseMenu'),
            resumeButton: document.getElementById('resumeButton'),
            restartButton: document.getElementById('restartButton'),

            // Victory screen
            victoryScreen: document.getElementById('victoryScreen'),
            winnerName: document.getElementById('winnerName'),
            rightName: document.getElementById('rightName'),
            leftName: document.getElementById('leftName'),
            rightCorrect: document.getElementById('rightCorrect'),
            leftCorrect: document.getElementById('leftCorrect'),
            rightSkips: document.getElementById('rightSkips'),
            leftSkips: document.getElementById('leftSkips'),
            rightTime: document.getElementById('rightTime'),
            leftTime: document.getElementById('leftTime'),
            playAgainButton: document.getElementById('playAgainButton'),

            // Loading screen
            loadingScreen: document.getElementById('loadingScreen'),

            // Ready screen
            readyScreen: document.getElementById('readyScreen'),

            // Countdown screen
            countdownScreen: document.getElementById('countdownScreen'),
            countdownNumber: document.getElementById('countdownNumber'),

            // Correct answer toast
            correctAnswerToast: document.getElementById('correctAnswerToast'),
            correctAnswerText: document.getElementById('correctAnswerText'),

            // Game container
            gameContainer: document.getElementById('gameContainer')
        };

        // Set up event listeners
        setupEventListeners();

        console.log('UI initialized');
    }

    // Set up event listeners
    function setupEventListeners() {
        // Timer updates
        window.addEventListener('timerUpdate', handleTimerUpdate);

        // State changes
        window.addEventListener('stateChanged', handleStateChange);

        // Skip penalty complete
        window.addEventListener('skipPenaltyComplete', handleSkipPenaltyComplete);

        // Pause menu buttons
        elements.resumeButton.addEventListener('click', () => {
            hidePauseMenu();
            GameState.resumeGame();
            TimerSystem.resume();
            AudioManager.resumeBackgroundMusic();
        });

        elements.restartButton.addEventListener('click', () => {
            if (confirm('האם אתה בטוח שברצונך להתחיל מחדש?')) {
                TimerSystem.stop();
                AudioManager.stopBackgroundMusic();
                GameState.restart();
            }
        });

        // Play again button
        elements.playAgainButton.addEventListener('click', () => {
            TimerSystem.stop();
            AudioManager.stopBackgroundMusic();
            GameState.restart();
        });

        // Browser focus/blur
        window.addEventListener('blur', () => {
            if (GameState.isRunningState() || GameState.isSkipPenaltyState()) {
                GameState.pauseGame();
                TimerSystem.pause();
                AudioManager.pauseBackgroundMusic();
                showPauseMenu();
            }
        });
    }

    // Handle timer update
    function handleTimerUpdate(event) {
        const { contestant, time } = event.detail;
        const timeElement = contestant === 'RIGHT' ? elements.timeRight : elements.timeLeft;
        const timerBox = contestant === 'RIGHT' ? elements.timerRight : elements.timerLeft;
        
        // Update display (round to nearest integer)
        timeElement.textContent = Math.ceil(Math.max(0, time));

        // Add warning class if time is low
        if (time <= 10 && time > 0) {
            timerBox.classList.add('warning');
        }
    }

    // Handle state changes
    function handleStateChange(event) {
        const { state, previousState } = event.detail;
        console.log('UI handling state change:', previousState, '->', state);

        updateActiveTimer();

        // Handle specific state transitions
        if (state === GameState.STATES.GAME_OVER) {
            showVictoryScreen();
        }
    }

    // Update active timer highlighting
    function updateActiveTimer() {
        const activeContestant = GameState.getActiveContestant();
        
        if (activeContestant === 'RIGHT') {
            elements.timerRight.classList.add('active', 'activate');
            elements.timerLeft.classList.remove('active');
            setTimeout(() => elements.timerRight.classList.remove('activate'), 500);
        } else if (activeContestant === 'LEFT') {
            elements.timerLeft.classList.add('active', 'activate');
            elements.timerRight.classList.remove('active');
            setTimeout(() => elements.timerLeft.classList.remove('activate'), 500);
        }
    }

    // Handle skip penalty complete
    function handleSkipPenaltyComplete() {
        hideAnswerOverlay();
        loadNextQuestion();
    }

    // Show correct answer feedback
    function showCorrectFeedback() {
        elements.questionContainer.classList.add('correct');
        setTimeout(() => {
            elements.questionContainer.classList.remove('correct');
        }, 600);
    }

    // Load next question
    function loadNextQuestion() {
        const question = QuestionManager.getNextQuestion();
        
        if (!question) {
            console.error('No question available');
            return;
        }

        GameState.setCurrentQuestion(question);
        displayQuestion(question);
    }

    // Display a question
    function displayQuestion(question) {
        elements.questionContent.innerHTML = '';

        if (question.type === 'text') {
            elements.questionContent.textContent = question.content;
        } else if (question.type === 'image') {
            const img = document.createElement('img');
            
            // Check if content is a URL or local file path
            const isURL = question.content.startsWith('http://') || question.content.startsWith('https://');
            
            if (isURL) {
                // Use URL directly
                img.src = question.content;
            } else {
                // Treat as local file path (relative to project root)
                img.src = question.content;
            }
            
            img.alt = 'שאלה';
            img.onerror = () => {
                console.error('Failed to load image:', question.content);
                // Fallback: show the path as text
                elements.questionContent.textContent = `[תמונה לא נמצאה: ${question.content}]`;
            };
            elements.questionContent.appendChild(img);
        }
    }

    // Show answer overlay (during skip penalty)
    function showAnswerOverlay() {
        const state = GameState.getState();
        if (state.currentAnswer) {
            elements.answerContent.textContent = state.currentAnswer;
            elements.answerOverlay.classList.remove('hidden');
        }
    }

    // Hide answer overlay
    function hideAnswerOverlay() {
        elements.answerOverlay.classList.add('hidden');
    }

    // Show pause menu
    function showPauseMenu() {
        elements.pauseMenu.classList.remove('hidden');
        // Hide game content for cleaner pause view
        elements.gameContainer.style.opacity = '0.3';
    }

    // Hide pause menu
    function hidePauseMenu() {
        elements.pauseMenu.classList.add('hidden');
        elements.gameContainer.style.opacity = '1';
    }

    // Show victory screen
    function showVictoryScreen() {
        const state = GameState.getState();
        const winner = state.winner;
        const rightContestant = state.contestants.RIGHT;
        const leftContestant = state.contestants.LEFT;

        // Set winner name
        elements.winnerName.textContent = state.contestants[winner].name;

        // Set contestant names
        elements.rightName.textContent = rightContestant.name;
        elements.leftName.textContent = leftContestant.name;

        // Set statistics
        elements.rightCorrect.textContent = rightContestant.questionsAnswered;
        elements.leftCorrect.textContent = leftContestant.questionsAnswered;
        elements.rightSkips.textContent = rightContestant.questionsSkipped;
        elements.leftSkips.textContent = leftContestant.questionsSkipped;
        elements.rightTime.textContent = Math.ceil(Math.max(0, rightContestant.timeRemaining)) + ' שניות';
        elements.leftTime.textContent = Math.ceil(Math.max(0, leftContestant.timeRemaining)) + ' שניות';

        // Show victory screen
        elements.victoryScreen.classList.remove('hidden');

        // Play game over sound
        AudioManager.playGameOver();

        // Stop background music
        AudioManager.stopBackgroundMusic();
    }

    // Hide loading screen
    function hideLoadingScreen() {
        elements.loadingScreen.classList.add('hidden');
    }

    // Show ready screen (Press any key to start)
    function showReadyScreen() {
        return new Promise((resolve) => {
            elements.readyScreen.classList.remove('hidden');
            console.log('⌨️ Waiting for user to press any key...');
            
            const startCountdown = (event) => {
                event.preventDefault();
                console.log('🎮 Key pressed! Starting countdown...');
                elements.readyScreen.classList.add('hidden');
                resolve();
            };
            
            document.addEventListener('keydown', startCountdown, { once: true });
            document.addEventListener('click', startCountdown, { once: true });
        });
    }

    // Show countdown (3-2-1-GO!)
    async function showCountdown() {
        return new Promise(async (resolve) => {
            elements.countdownScreen.classList.remove('hidden');
            
            // Start playing countdown sound (but don't wait for it to finish)
            console.log('🔊 Playing countdown sound...');
            const countdownPromise = AudioManager.playCountdown().catch(err => {
                console.warn('⚠️ Countdown audio failed, continuing anyway:', err);
            });
            
            // After countdown.mp3 finishes, start background music
            countdownPromise.then(() => {
                console.log('🎵 Countdown audio finished! Starting background music...');
                AudioManager.startBackgroundMusic();
            });
            
            let count = 3;
            
            function updateCountdown() {
                if (count > 0) {
                    // Show number
                    elements.countdownNumber.textContent = count;
                    elements.countdownNumber.classList.remove('go');
                    // Force reflow to restart animation
                    elements.countdownNumber.style.animation = 'none';
                    setTimeout(() => {
                        elements.countdownNumber.style.animation = '';
                    }, 10);
                    
                    count--;
                    setTimeout(updateCountdown, 1000);
                } else {
                    // Show GO!
                    elements.countdownNumber.textContent = '!GO';
                    elements.countdownNumber.classList.add('go');
                    // Force reflow to restart animation
                    elements.countdownNumber.style.animation = 'none';
                    setTimeout(() => {
                        elements.countdownNumber.style.animation = '';
                    }, 10);
                    
                    // Hide countdown and resolve after GO is shown (1 second)
                    setTimeout(() => {
                        elements.countdownScreen.classList.add('hidden');
                        console.log('✅ Visual countdown complete, starting game!');
                        resolve();
                    }, 1000);
                }
            }
            
            updateCountdown();
        });
    }

    // Show correct answer toast
    function showCorrectAnswerToast(answer) {
        elements.correctAnswerText.textContent = answer;
        elements.correctAnswerToast.classList.remove('hidden', 'fade-out');
        
        // Hide after 2.5 seconds
        setTimeout(() => {
            elements.correctAnswerToast.classList.add('fade-out');
            setTimeout(() => {
                elements.correctAnswerToast.classList.add('hidden');
            }, 300);
        }, 2500);
    }

    // Initialize game display
    function initializeGameDisplay() {
        try {
            const state = GameState.getState();
            const rightContestant = state.contestants.RIGHT;
            const leftContestant = state.contestants.LEFT;

            // Set contestant names
            console.log('Setting contestant names...');
            elements.labelRight.textContent = rightContestant.name;
            elements.labelLeft.textContent = leftContestant.name;

            // Set initial times
            console.log('Setting initial times...');
            elements.timeRight.textContent = Math.ceil(rightContestant.timeRemaining);
            elements.timeLeft.textContent = Math.ceil(leftContestant.timeRemaining);

            // Set category
            console.log('Setting category display...');
            elements.categoryDisplay.textContent = QuestionManager.getCategory();

            // Load first question
            console.log('Loading first question...');
            loadNextQuestion();

            // Update active timer
            console.log('Updating active timer...');
            updateActiveTimer();
            
            console.log('Game display initialized successfully');
        } catch (error) {
            console.error('Error in initializeGameDisplay:', error);
            throw error;
        }
    }

    // Public API
    return {
        init,
        showCorrectFeedback,
        showCorrectAnswerToast,
        loadNextQuestion,
        showAnswerOverlay,
        hideAnswerOverlay,
        showPauseMenu,
        hidePauseMenu,
        hideLoadingScreen,
        showReadyScreen,
        showCountdown,
        initializeGameDisplay
    };
})();

// Main game initialization
(async function() {
    'use strict';

    try {
        console.log('Initializing Duel Trivia Game...');

        // Initialize game state from config
        if (!GameState.init()) {
            return; // Redirects to setup if no config found
        }

        // Initialize audio system
        AudioManager.init();

        // Load questions
        const state = GameState.getState();
        console.log('Loading questions for category:', state.settings.category);
        const questionsLoaded = await QuestionManager.loadQuestions(state.settings.category);
        
        if (!questionsLoaded) {
            alert('שגיאה בטעינת שאלות! חוזר למסך ההגדרות.');
            window.location.href = 'setup.html';
            return;
        }

        // Initialize UI
        console.log('Initializing UI...');
        UI.init();

        // Initialize keyboard controls
        console.log('Initializing keyboard controls...');
        KeyboardController.init();

        // Set up game display
        console.log('Setting up game display...');
        UI.initializeGameDisplay();

        // Hide loading screen
        console.log('Hiding loading screen...');
        UI.hideLoadingScreen();

        // Show ready screen (wait for user to press any key)
        console.log('Showing ready screen...');
        await UI.showReadyScreen();

        // Enter countdown state (allows keyboard input during countdown)
        console.log('Entering countdown state...');
        GameState.enterCountdown();

        // Show countdown (3-2-1-GO!)
        console.log('Starting countdown animation...');
        await UI.showCountdown();
        // Note: Background music is now started inside showCountdown()

        // Start the game state (transition from COUNTDOWN to RUNNING)
        console.log('Starting game state...');
        GameState.startGame();

        // Small delay to ensure state transition completes
        await new Promise(resolve => setTimeout(resolve, 50));

        // Start timers (begin actual countdown)
        console.log('Starting timers...');
        console.log('Current game state:', GameState.getCurrentState());
        console.log('Active contestant:', GameState.getActiveContestant());
        TimerSystem.start();

        console.log('Game started successfully!');
    } catch (error) {
        console.error('FATAL ERROR during game initialization:', error);
        
        // Always try to hide loading screen even on error
        try {
            UI.hideLoadingScreen();
        } catch (e) {
            // If UI isn't initialized, hide loading screen directly
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }
        
        alert('שגיאה קריטית בטעינת המשחק: ' + error.message + '\n\nבדוק את הקונסול לפרטים נוספים.');
    }
})();

