# Questions Data

## ⚠️ Important Note

Questions are now embedded in **`js/questionsData.js`** for maximum offline compatibility.

This `questions.json` file is kept for reference only and is not actively used by the game.

## To Add or Edit Questions

Edit the file: **`js/questionsData.js`**

Example:
```javascript
const QUESTIONS_DATA = {
  "קטגוריה חדשה": [
    {
      "type": "text",
      "content": "השאלה שלך?",
      "answer": "התשובה"
    }
  ]
};
```

No file loading, no CORS issues, works 100% offline! 🎮

