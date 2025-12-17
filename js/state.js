// Game state management - state machine and game state

const GameState = (function() {
    'use strict';

    // Game states
    const STATES = {
        INIT: 'INIT',
        COUNTDOWN: 'COUNTDOWN',
        RUNNING_RIGHT: 'RUNNING_RIGHT',
        RUNNING_LEFT: 'RUNNING_LEFT',
        SKIP_PENALTY_RIGHT: 'SKIP_PENALTY_RIGHT',
        SKIP_PENALTY_LEFT: 'SKIP_PENALTY_LEFT',
        PAUSED: 'PAUSED',
        GAME_OVER: 'GAME_OVER'
    };

    // Game state object
    let state = {
        currentState: STATES.INIT,
        previousState: null,
        activeContestant: null, // 'RIGHT' or 'LEFT'
        
        contestants: {
            RIGHT: {
                name: 'ימין',
                timeRemaining: 45,
                questionsAnswered: 0,
                questionsSkipped: 0,
                isActive: false
            },
            LEFT: {
                name: 'שמאל',
                timeRemaining: 45,
                questionsAnswered: 0,
                questionsSkipped: 0,
                isActive: false
            }
        },

        settings: {
            category: '',
            skipPenalty: 3,
            startingContestant: 'RIGHT'
        },

        currentQuestion: null,
        currentAnswer: null,
        
        // Skip penalty tracking
        skipStartTime: null,
        skipDuration: 3000, // 3 seconds in milliseconds

        winner: null
    };

    // Initialize game from localStorage config
    function init() {
        const config = localStorage.getItem('gameConfig');
        
        if (!config) {
            console.error('No game configuration found!');
            window.location.href = 'index.html';
            return false;
        }

        const gameConfig = JSON.parse(config);
        
        // Set up contestants
        state.contestants.RIGHT.name = gameConfig.contestants.RIGHT.name;
        state.contestants.RIGHT.timeRemaining = gameConfig.contestants.RIGHT.startTime;
        state.contestants.LEFT.name = gameConfig.contestants.LEFT.name;
        state.contestants.LEFT.timeRemaining = gameConfig.contestants.LEFT.startTime;

        // Set up settings
        state.settings.category = gameConfig.category;
        state.settings.skipPenalty = gameConfig.skipPenalty;
        state.settings.startingContestant = gameConfig.startingContestant;
        state.skipDuration = gameConfig.skipPenalty * 1000;

        // Set active contestant
        state.activeContestant = gameConfig.startingContestant;
        state.contestants[state.activeContestant].isActive = true;

        return true;
    }

    // Transition to a new state
    function transitionTo(newState) {
        console.log(`State transition: ${state.currentState} -> ${newState}`);
        state.previousState = state.currentState;
        state.currentState = newState;
        
        // Emit state change event
        window.dispatchEvent(new CustomEvent('stateChanged', { 
            detail: { 
                state: newState, 
                previousState: state.previousState 
            } 
        }));
    }

    // Enter countdown state (after ready screen, before timers start)
    function enterCountdown() {
        if (state.currentState === STATES.INIT) {
            transitionTo(STATES.COUNTDOWN);
        }
    }

    // Start the game (after countdown completes)
    function startGame() {
        if (state.currentState === STATES.INIT || state.currentState === STATES.COUNTDOWN) {
            const startState = state.activeContestant === 'RIGHT' 
                ? STATES.RUNNING_RIGHT 
                : STATES.RUNNING_LEFT;
            transitionTo(startState);
        }
    }

    // Handle correct answer
    function handleCorrect() {
        if (!isRunningState()) return;

        state.contestants[state.activeContestant].questionsAnswered++;
        switchContestant();
    }

    // Handle skip
    function handleSkip() {
        if (!isRunningState()) return;

        const skipState = state.activeContestant === 'RIGHT' 
            ? STATES.SKIP_PENALTY_RIGHT 
            : STATES.SKIP_PENALTY_LEFT;
        
        state.skipStartTime = Date.now();
        transitionTo(skipState);
    }

    // Check if skip penalty duration has elapsed
    function checkSkipPenaltyComplete() {
        if (!isSkipPenaltyState()) return false;

        const elapsed = Date.now() - state.skipStartTime;
        
        if (elapsed >= state.skipDuration) {
            // Skip penalty complete
            state.contestants[state.activeContestant].questionsSkipped++;
            state.skipStartTime = null;
            
            // Return to running state with same contestant
            const runningState = state.activeContestant === 'RIGHT' 
                ? STATES.RUNNING_RIGHT 
                : STATES.RUNNING_LEFT;
            transitionTo(runningState);
            return true;
        }
        
        return false;
    }

    // Switch active contestant
    function switchContestant() {
        // Deactivate current
        state.contestants[state.activeContestant].isActive = false;
        
        // Switch
        state.activeContestant = state.activeContestant === 'RIGHT' ? 'LEFT' : 'RIGHT';
        
        // Activate new
        state.contestants[state.activeContestant].isActive = true;
        
        // Transition to new running state
        const newState = state.activeContestant === 'RIGHT' 
            ? STATES.RUNNING_RIGHT 
            : STATES.RUNNING_LEFT;
        transitionTo(newState);
    }

    // Pause game
    function pauseGame() {
        if (isRunningState() || isSkipPenaltyState()) {
            transitionTo(STATES.PAUSED);
        }
    }

    // Resume game
    function resumeGame() {
        if (state.currentState === STATES.PAUSED) {
            // Resume to previous state
            if (state.previousState) {
                transitionTo(state.previousState);
            }
        }
    }

    // End game
    function endGame(winner) {
        state.winner = winner;
        transitionTo(STATES.GAME_OVER);
    }

    // Update time remaining
    function updateTime(contestant, newTime) {
        state.contestants[contestant].timeRemaining = Math.max(0, newTime);
        
        // Check for game over
        if (state.contestants[contestant].timeRemaining <= 0) {
            const winner = contestant === 'RIGHT' ? 'LEFT' : 'RIGHT';
            endGame(winner);
        }
    }

    // Set current question and answer
    function setCurrentQuestion(question) {
        state.currentQuestion = question;
        state.currentAnswer = question ? question.answer : null;
    }

    // Helper functions
    function isRunningState() {
        return state.currentState === STATES.RUNNING_RIGHT || 
               state.currentState === STATES.RUNNING_LEFT ||
               state.currentState === STATES.COUNTDOWN;
    }

    function isSkipPenaltyState() {
        return state.currentState === STATES.SKIP_PENALTY_RIGHT || 
               state.currentState === STATES.SKIP_PENALTY_LEFT;
    }

    function isPaused() {
        return state.currentState === STATES.PAUSED;
    }

    function isGameOver() {
        return state.currentState === STATES.GAME_OVER;
    }

    function getState() {
        return state;
    }

    function getCurrentState() {
        return state.currentState;
    }

    function getActiveContestant() {
        return state.activeContestant;
    }

    function getContestant(side) {
        return state.contestants[side];
    }

    function getCurrentQuestion() {
        return state.currentQuestion;
    }

    // Restart game
    function restart() {
        window.location.href = 'index.html';
    }

    // Public API
    return {
        STATES,
        init,
        enterCountdown,
        startGame,
        handleCorrect,
        handleSkip,
        checkSkipPenaltyComplete,
        pauseGame,
        resumeGame,
        endGame,
        updateTime,
        setCurrentQuestion,
        isRunningState,
        isSkipPenaltyState,
        isPaused,
        isGameOver,
        getState,
        getCurrentState,
        getActiveContestant,
        getContestant,
        getCurrentQuestion,
        restart
    };
})();

