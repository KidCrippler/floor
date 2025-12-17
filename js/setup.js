// Setup screen logic - loads categories and saves configuration

(function() {
    'use strict';

    // Analyze questions to determine if category has text or image questions
    function analyzeQuestions(categoryQuestions) {
        let hasText = false;
        let hasImage = false;
        
        for (const question of categoryQuestions) {
            if (question.type === 'text') {
                hasText = true;
            } else if (question.type === 'image') {
                hasImage = true;
            }
            
            // Early exit if we found both
            if (hasText && hasImage) {
                break;
            }
        }
        
        return { hasText, hasImage };
    }

    // Load categories from embedded data
    function loadCategories() {
        const categorySelect = document.getElementById('category');
        
        try {
            // Use embedded QUESTIONS_DATA (no file loading needed!)
            const questions = QUESTIONS_DATA;
            const metadata = typeof QUIZ_METADATA !== 'undefined' ? QUIZ_METADATA : {};
            
            // Clear loading option
            categorySelect.innerHTML = '';
            
            // Add categories
            const categories = Object.keys(questions);
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                
                // Analyze questions to determine content types
                const questionAnalysis = analyzeQuestions(questions[category]);
                
                // Build badge string
                let badges = '';
                if (metadata[category]?.aiGenerated === true) {
                    badges += ' 🤖';
                }
                if (questionAnalysis.hasText) {
                    badges += ' 📝';
                }
                if (questionAnalysis.hasImage) {
                    badges += ' 🖼️';
                }
                
                // Simply append badges to category name
                option.textContent = category + badges;
                
                categorySelect.appendChild(option);
            });

            // Select first category by default
            if (categories.length > 0) {
                categorySelect.value = categories[0];
            }
            
            console.log('Categories loaded:', categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            categorySelect.innerHTML = '<option value="">שגיאה בטעינת קטגוריות</option>';
        }
    }

    // Handle form submission
    function handleSubmit(event) {
        event.preventDefault();

        const formData = {
            category: document.getElementById('category').value,
            contestants: {
                RIGHT: {
                    name: document.getElementById('nameRight').value,
                    startTime: parseInt(document.getElementById('timeRight').value, 10)
                },
                LEFT: {
                    name: document.getElementById('nameLeft').value,
                    startTime: parseInt(document.getElementById('timeLeft').value, 10)
                }
            },
            skipPenalty: parseInt(document.getElementById('skipPenalty').value, 10),
            startingContestant: document.querySelector('input[name="startingContestant"]:checked').value
        };

        // Validate category selection
        if (!formData.category) {
            alert('אנא בחר קטגוריה');
            return;
        }

        // Save to localStorage
        localStorage.setItem('gameConfig', JSON.stringify(formData));

        // Redirect to game
        window.location.href = 'game.html';
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        loadCategories();
        document.getElementById('setupForm').addEventListener('submit', handleSubmit);
    });
})();

