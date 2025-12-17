// Setup screen logic - loads categories and saves configuration

(function() {
    'use strict';

    // Load categories from embedded data
    function loadCategories() {
        const categorySelect = document.getElementById('category');
        
        try {
            // Use embedded QUESTIONS_DATA (no file loading needed!)
            const questions = QUESTIONS_DATA;
            
            // Clear loading option
            categorySelect.innerHTML = '';
            
            // Add categories
            const categories = Object.keys(questions);
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
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

