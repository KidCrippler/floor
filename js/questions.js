// Question management - loads, shuffles, and cycles through questions

const QuestionManager = (function() {
    'use strict';

    let allQuestions = [];
    let unusedQuestions = [];
    let currentQuestion = null;
    let category = '';

    // Load questions from embedded data
    function loadQuestions(selectedCategory) {
        return new Promise((resolve) => {
            try {
                // Use embedded QUESTIONS_DATA (no file loading needed!)
                const questionsData = QUESTIONS_DATA;
                
                category = selectedCategory;
                
                if (!questionsData[category]) {
                    console.error(`Category "${category}" not found`);
                    resolve(false);
                    return;
                }

                allQuestions = questionsData[category];
                
                if (allQuestions.length === 0) {
                    console.error(`No questions found in category "${category}"`);
                    resolve(false);
                    return;
                }

                // Initialize with shuffled questions
                resetPool();
                
                console.log(`Loaded ${allQuestions.length} questions from category "${category}"`);
                resolve(true);
            } catch (error) {
                console.error('Error loading questions:', error);
                resolve(false);
            }
        });
    }

    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Reset the question pool (reshuffle all questions)
    function resetPool() {
        unusedQuestions = shuffleArray(allQuestions);
        console.log(`Question pool reset and shuffled: ${unusedQuestions.length} questions`);
    }

    // Get next question
    function getNextQuestion() {
        // If we've used all questions, reset and reshuffle
        if (unusedQuestions.length === 0) {
            console.log('All questions used, reshuffling...');
            resetPool();
        }

        // Get the next question
        currentQuestion = unusedQuestions.pop();
        
        console.log(`Questions remaining in pool: ${unusedQuestions.length}`);
        
        return currentQuestion;
    }

    // Get current question
    function getCurrentQuestion() {
        return currentQuestion;
    }

    // Get remaining question count
    function getRemainingCount() {
        return unusedQuestions.length;
    }

    // Get total question count
    function getTotalCount() {
        return allQuestions.length;
    }

    // Get category name
    function getCategory() {
        return category;
    }

    // Public API
    return {
        loadQuestions,
        getNextQuestion,
        getCurrentQuestion,
        getRemainingCount,
        getTotalCount,
        getCategory
    };
})();

