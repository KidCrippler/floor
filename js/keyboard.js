// Keyboard controls - handles game input

const KeyboardController = (function() {
    'use strict';

    let enabled = false;
    let showingAnswer = false; // Flag to prevent Space during answer display

    // Initialize keyboard controls
    function init() {
        document.addEventListener('keydown', handleKeyPress);
        enabled = true;
        console.log('Keyboard controls initialized');
    }

    // Handle key press events
    function handleKeyPress(event) {
        if (!enabled) return;

        const key = event.key.toLowerCase();
        const currentState = GameState.getCurrentState();

        // Prevent default browser behavior for our keys
        if (['Escape', ' ', 's', 'r'].includes(key) || event.code === 'Space') {
            event.preventDefault();
        }

        // Handle based on current game state
        switch (currentState) {
            case GameState.STATES.INIT:
                // No keys active during init
                break;

            case GameState.STATES.COUNTDOWN:
                // During countdown, allow all keys (ESC, SPACE, S) so players can respond immediately
                if (key === 'escape') {
                    handlePause();
                } else {
                    handleRunningStateKeys(key, event.code);
                }
                break;

            case GameState.STATES.RUNNING_RIGHT:
            case GameState.STATES.RUNNING_LEFT:
                handleRunningStateKeys(key, event.code);
                break;

            case GameState.STATES.SKIP_PENALTY_RIGHT:
            case GameState.STATES.SKIP_PENALTY_LEFT:
                // During skip penalty, only ESC is allowed
                if (key === 'escape') {
                    handlePause();
                }
                break;

            case GameState.STATES.PAUSED:
                handlePausedStateKeys(key);
                break;

            case GameState.STATES.GAME_OVER:
                handleGameOverKeys(key);
                break;
        }
    }

    // Handle keys during running state
    function handleRunningStateKeys(key, code) {
        if (code === 'Space' || key === ' ') {
            // Ignore Space if we're currently showing an answer
            if (!showingAnswer) {
                handleCorrectAnswer();
            }
        } else if (key === 's') {
            handleSkip();
        } else if (key === 'escape') {
            handlePause();
        } else if (key === 'r') {
            handleRestart();
        }
    }

    // Handle keys during paused state
    function handlePausedStateKeys(key) {
        if (key === 'escape') {
            handleResume();
        } else if (key === 'r') {
            handleRestart();
        }
    }

    // Handle keys during game over state
    function handleGameOverKeys(key) {
        if (key === 'r' || key === ' ' || key === 'escape') {
            handlePlayAgain();
        }
    }

    // Correct answer handler (SPACE)
    function handleCorrectAnswer() {
        console.log('Correct answer!');
        
        // Set flag to prevent additional Space presses
        showingAnswer = true;
        
        // If we're in countdown state, start timers immediately
        if (GameState.getCurrentState() === GameState.STATES.COUNTDOWN) {
            console.log('Starting timers early due to key press during countdown');
            TimerSystem.start();
        }
        
        // Get current answer before switching
        const state = GameState.getState();
        const currentAnswer = state.currentAnswer;
        
        // Play sound effect
        AudioManager.playCorrect();
        
        // Visual feedback
        UI.showCorrectFeedback();
        
        // Show the correct answer toast
        if (currentAnswer) {
            UI.showCorrectAnswerToast(currentAnswer);
        }
        
        // Update game state
        GameState.handleCorrect();
        
        // UI will handle loading the next question after showing answer for 1 second
        // (no need to call loadNextQuestion here anymore)
    }
    
    // Clear the showing answer flag (called when next question loads)
    function clearShowingAnswer() {
        showingAnswer = false;
    }

    // Skip handler (S)
    function handleSkip() {
        console.log('Skip!');
        
        // If we're in countdown state, start timers immediately
        if (GameState.getCurrentState() === GameState.STATES.COUNTDOWN) {
            console.log('Starting timers early due to key press during countdown');
            TimerSystem.start();
        }
        
        // Play sound effect
        AudioManager.playSkip();
        
        // Update game state (enters skip penalty state)
        GameState.handleSkip();
        
        // Show answer overlay
        UI.showAnswerOverlay();
    }

    // Pause handler (ESC)
    function handlePause() {
        console.log('Pause');
        
        GameState.pauseGame();
        TimerSystem.pause();
        AudioManager.pauseBackgroundMusic();
        UI.showPauseMenu();
    }

    // Resume handler (ESC while paused)
    function handleResume() {
        console.log('Resume');
        
        UI.hidePauseMenu();
        GameState.resumeGame();
        TimerSystem.resume();
        AudioManager.resumeBackgroundMusic();
    }

    // Restart handler (R)
    function handleRestart() {
        const confirmed = confirm('האם אתה בטוח שברצונך להתחיל מחדש?');
        if (confirmed) {
            console.log('Restart confirmed');
            TimerSystem.stop();
            AudioManager.stopBackgroundMusic();
            GameState.restart();
        }
    }

    // Play again handler (from game over screen)
    function handlePlayAgain() {
        console.log('Play again');
        TimerSystem.stop();
        AudioManager.stopBackgroundMusic();
        GameState.restart();
    }

    // Enable keyboard controls
    function enable() {
        enabled = true;
    }

    // Disable keyboard controls
    function disable() {
        enabled = false;
    }

    // Public API
    return {
        init,
        enable,
        disable,
        clearShowingAnswer
    };
})();

