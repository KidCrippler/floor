// Timer system - manages countdown for both contestants

const TimerSystem = (function() {
    'use strict';

    let timerInterval = null;
    let lastUpdateTime = null;
    let tickCount = 0; // For debugging

    const WARNING_THRESHOLD = 10; // seconds (for visual warning only)

    // Start the timer system
    function start() {
        // If already running, just return (don't restart)
        if (timerInterval) {
            console.log('Timer already running, not restarting');
            return;
        }

        console.log('Starting timer system');
        lastUpdateTime = Date.now();
        tickCount = 0;
        timerInterval = setInterval(tick, 100); // 100ms resolution
    }

    // Stop the timer system
    function stop() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        lastUpdateTime = null;
    }

    // Timer tick - called every 100ms
    function tick() {
        tickCount++;
        
        const currentState = GameState.getCurrentState();
        
        // Don't update if paused, game over, or in countdown
        if (GameState.isPaused() || 
            GameState.isGameOver() || 
            currentState === GameState.STATES.COUNTDOWN ||
            currentState === GameState.STATES.INIT) {
            if (tickCount <= 5) {
                console.log(`Timer tick #${tickCount}: Skipping (state: ${currentState})`);
            }
            return;
        }

        const now = Date.now();
        const elapsed = (now - lastUpdateTime) / 1000; // Convert to seconds
        lastUpdateTime = now;

        const activeContestant = GameState.getActiveContestant();
        
        if (!activeContestant) {
            console.warn('Timer tick: no active contestant');
            return;
        }

        // Update time
        const contestant = GameState.getContestant(activeContestant);
        const newTime = contestant.timeRemaining - elapsed;
        
        // Log first few ticks for debugging
        if (tickCount <= 10) {
            console.log(`Timer tick #${tickCount}: ${activeContestant} - ${newTime.toFixed(1)}s (elapsed: ${elapsed.toFixed(3)}s)`);
        }
        
        GameState.updateTime(activeContestant, newTime);

        // Check if we're in skip penalty state and if it's complete
        if (GameState.isSkipPenaltyState()) {
            if (GameState.checkSkipPenaltyComplete()) {
                // Skip penalty completed, question will be changed by the game loop
                window.dispatchEvent(new CustomEvent('skipPenaltyComplete'));
            }
        }

        // Emit timer update event for UI
        window.dispatchEvent(new CustomEvent('timerUpdate', {
            detail: {
                contestant: activeContestant,
                time: newTime
            }
        }));
    }

    // Pause timer
    function pause() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Resume timer
    function resume() {
        if (!timerInterval && !GameState.isGameOver()) {
            lastUpdateTime = Date.now();
            timerInterval = setInterval(tick, 100);
        }
    }

    // Public API
    return {
        start,
        stop,
        pause,
        resume
    };
})();

