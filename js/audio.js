// Audio management - sound effects and background music

const AudioManager = (function() {
    'use strict';

    let sounds = {};
    let backgroundMusic = null;
    let initialized = false;

    // Sound file paths
    const SOUND_FILES = {
        correct: 'sounds/correct.mp3',
        skip: 'sounds/skip.wav',
        gameover: 'sounds/gameover.mp3',
        background: 'sounds/background.mp3',
        countdown: 'sounds/countdown.mp3'  // Contains 3, 2, 1, GO
    };

    // Initialize audio system
    function init() {
        if (initialized) return;

        // Preload sound effects
        for (const [name, path] of Object.entries(SOUND_FILES)) {
            if (name === 'background') {
                // Special handling for background music
                backgroundMusic = new Audio(path);
                backgroundMusic.loop = true;
                backgroundMusic.volume = 0.3; // Lower volume for background music
                
                // Handle loading errors gracefully
                backgroundMusic.addEventListener('error', () => {
                    console.warn(`Background music file not found: ${path}`);
                    backgroundMusic = null;
                });
            } else {
                // Sound effects
                const audio = new Audio(path);
                audio.volume = 0.6;
                audio.preload = 'auto';
                
                // Handle loading errors gracefully
                audio.addEventListener('error', () => {
                    console.warn(`Sound file not found: ${path}`);
                });
                
                sounds[name] = audio;
            }
        }

        initialized = true;
        console.log('🎵 Audio system initialized');
        console.log('Loaded sounds:', Object.keys(sounds));
        console.log('Background music:', backgroundMusic ? 'loaded' : 'not loaded');
        
        // Verify countdown specifically
        if (sounds['countdown']) {
            console.log('✅ Countdown sound loaded:', sounds['countdown'].src);
        } else {
            console.error('❌ Countdown sound NOT in sounds object!');
        }
    }

    // Play a sound effect
    function playSound(soundName) {
        if (!sounds[soundName]) {
            console.warn(`⚠️ Sound "${soundName}" not found in loaded sounds`);
            return;
        }

        try {
            // Clone the audio to allow overlapping plays
            const audio = sounds[soundName].cloneNode();
            audio.volume = sounds[soundName].volume;
            audio.play().then(() => {
                console.log(`🔊 Playing sound: ${soundName}`);
            }).catch(err => {
                console.warn(`❌ Failed to play sound "${soundName}":`, err.name, err.message);
            });
        } catch (error) {
            console.error(`Error playing sound "${soundName}":`, error);
        }
    }

    // Play correct answer sound
    function playCorrect() {
        playSound('correct');
    }

    // Play skip sound
    function playSkip() {
        playSound('skip');
    }

    // Play game over sound
    function playGameOver() {
        playSound('gameover');
    }

    // Play countdown sound (3, 2, 1) and return promise that resolves when done
    function playCountdown() {
        console.log('🎬 playCountdown() called');
        console.log('Available sounds:', Object.keys(sounds));
        console.log('Countdown sound exists?', sounds['countdown'] ? 'YES' : 'NO');
        
        return new Promise((resolve, reject) => {
            if (!sounds['countdown']) {
                console.error('❌ Countdown sound not loaded!');
                reject(new Error('Countdown sound not loaded'));
                return;
            }
            
            try {
                const audio = sounds['countdown'].cloneNode();
                audio.volume = sounds['countdown'].volume;
                
                // Resolve when countdown finishes playing
                audio.addEventListener('ended', () => {
                    console.log('✅ Countdown finished playing!');
                    resolve();
                });
                
                // Handle errors
                audio.addEventListener('error', (err) => {
                    console.error('❌ Error playing countdown:', err);
                    reject(err);
                });
                
                const playPromise = audio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('✅ Countdown started playing successfully!');
                    }).catch(err => {
                        console.warn('❌ Countdown blocked:', err.name);
                        reject(err);
                    });
                }
            } catch (error) {
                console.error('Error playing countdown:', error);
                reject(error);
            }
        });
    }

    // Start background music
    function startBackgroundMusic() {
        if (!backgroundMusic) {
            console.warn('Background music not available');
            return;
        }

        try {
            // Reset to beginning if already playing
            backgroundMusic.currentTime = 0;
            const playPromise = backgroundMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('✅ Background music started successfully!');
                }).catch(err => {
                    console.error('❌ Failed to play background music:', err.name, err.message);
                    console.warn('🔊 Browser blocked autoplay. Click anywhere on the page to start audio.');
                    
                    // Try to start music on next user interaction
                    const startOnClick = () => {
                        backgroundMusic.play().then(() => {
                            console.log('✅ Background music started after user interaction!');
                            document.removeEventListener('click', startOnClick);
                            document.removeEventListener('keydown', startOnClick);
                        }).catch(e => console.error('Still failed:', e));
                    };
                    
                    document.addEventListener('click', startOnClick, { once: true });
                    document.addEventListener('keydown', startOnClick, { once: true });
                });
            }
        } catch (error) {
            console.error('Error starting background music:', error);
        }
    }

    // Stop background music
    function stopBackgroundMusic() {
        if (!backgroundMusic) return;

        try {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        } catch (error) {
            console.warn('Error stopping background music:', error);
        }
    }

    // Pause background music
    function pauseBackgroundMusic() {
        if (!backgroundMusic) return;

        try {
            backgroundMusic.pause();
        } catch (error) {
            console.warn('Error pausing background music:', error);
        }
    }

    // Resume background music
    function resumeBackgroundMusic() {
        if (!backgroundMusic) return;

        try {
            backgroundMusic.play().catch(err => {
                console.warn('Failed to resume background music:', err);
            });
        } catch (error) {
            console.warn('Error resuming background music:', error);
        }
    }

    // Set background music volume
    function setBackgroundMusicVolume(volume) {
        if (!backgroundMusic) return;
        backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }

    // Check if background music is playing
    function isBackgroundMusicPlaying() {
        if (!backgroundMusic) return false;
        return !backgroundMusic.paused;
    }

    // Public API
    return {
        init,
        playCorrect,
        playSkip,
        playGameOver,
        playCountdown,
        startBackgroundMusic,
        stopBackgroundMusic,
        pauseBackgroundMusic,
        resumeBackgroundMusic,
        setBackgroundMusicVolume,
        isBackgroundMusicPlaying
    };
})();

