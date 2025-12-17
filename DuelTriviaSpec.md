# **Duel Trivia App -- Technical Specification (Hebrew + RTL)**

## **Overview**

This document defines the technical design for a lightweight,
browser-based trivia duel game inspired by *The Floor*.\
The app is intended for offline use and will be projected on a large
screen.\
Two contestants stand on each side, with one active at any moment.\
Only the game master (you) interacts with the system using keyboard
controls.

The entire UI should be **in Hebrew**, **right-to-left**, and fully
readable/usable on large screens.

------------------------------------------------------------------------

## **Core Functionality**

-   Displays one question at a time (text or image).\
-   Manages two **independent countdown timers**, one per contestant.\
-   Only one timer runs at a time (the active contestant).\
-   Game master controls correctness/skip using keyboard:
    -   **SPACE** → contestant answered correctly → switch to the other
        contestant.
    -   **S** → contestant skipped → add penalty (default 3 seconds) →
        same contestant continues.
-   Duel ends when one contestant's timer reaches **0**.
-   Entire app runs locally, offline, in a browser.

------------------------------------------------------------------------

## **Technology Stack**

### **Frontend Only**

-   **Vanilla JavaScript** (no frameworks)
-   **HTML5**
-   **CSS3**
-   Optional: Tailwind CSS *pre-compiled locally* if faster styling is
    desired.
-   Optional: Service worker for PWA/offline caching.

No backend, no HTTP requests beyond loading local JSON and images.

------------------------------------------------------------------------

## **Folder Structure**

    /index.html              (setup/entry screen)
    /game.html               (main game screen)
    /css/style.css
    /js/state.js
    /js/timers.js
    /js/questions.js
    /js/ui.js
    /data/questions.json
    /images/...

------------------------------------------------------------------------

## **RTL + Hebrew Requirements**

-   Entire UI defaults to `dir="rtl"` and `lang="he"`.\
-   All default labels, buttons, and visual indicators are in Hebrew.\
-   Font chosen must support Hebrew well at large sizes (e.g.,
    Assistant, Arimo, Alef).\
-   Text alignment: **right** by default, centered for questions.

------------------------------------------------------------------------

## **UI Layout**

### **Top Section**

-   Two large timer boxes:
    -   Right side: **שעון מתמודד א׳**
    -   Left side: **שעון מתמודד ב׳**
-   Each timer shows remaining seconds as large digits.
-   Active contestant's timer should be visually highlighted.

### **Center Section**

-   Large question box:
    -   Supports text questions.
    -   Supports image questions (scaled proportionally).
    -   Hebrew text should render in RTL automatically.

### **Bottom/Corner**

-   Remaining question count.
-   Minimal control buttons for setup and restart.
-   During duel, these controls are hidden or disabled.

------------------------------------------------------------------------

## **Game Flow**

### **Pre-Game Setup**

-   Configure:
    -   Starting time for contestant A (default 45 seconds)
    -   Starting time for contestant B (default 45 seconds)
    -   Skip penalty in seconds (default 3)
    -   Which contestant starts
-   Load all questions from `questions.json`.
-   Shuffle question order.

### **During Duel**

1.  Start with the chosen contestant.
2.  Their timer counts down continuously.
3.  Display next question.
4.  Game master uses keys:
    -   **SPACE** → correct → stop current timer → switch contestants →
        next question.
    -   **S** → skip → apply penalty → same contestant continues → next
        question.
5.  If a timer reaches 0:
    -   Duel ends.
    -   Show a large "המנצח הוא ..." screen.

### **Pause Handling**

-   If the browser loses focus, both timers pause.
-   ESC brings up a pause menu.

------------------------------------------------------------------------

## **Timers**

-   Implemented with `setInterval` (100 ms resolution).
-   Only one timer is active at any given moment.
-   Timer object tracks:
    -   Remaining seconds
    -   Whether active
    -   Last update timestamp

------------------------------------------------------------------------

## **Question Storage**

A single local JSON file at `/data/questions.json`.

Example structure:

``` json
[
  { "type": "text", "content": "מהי עיר הבירה של יפן?" },
  { "type": "image", "content": "images/picture1.png" }
]
```

Notes: - Hebrew text should appear exactly as entered. - Image questions
must scale but maintain aspect ratio.

------------------------------------------------------------------------

## **Keyboard Controls**

  Key         Action
  ----------- ----------------------------------------------------
  **SPACE**   Correct answer → switch contestant + next question
  **S**       Skip → apply penalty (e.g., +3s) → next question
  **ESC**     Pause menu
  **R**       Restart duel (with confirmation)

No other keys should trigger actions.

------------------------------------------------------------------------

## **State Machine**

### **States**

-   `INIT`
-   `RUNNING_A`
-   `RUNNING_B`
-   `PAUSED`
-   `GAME_OVER`

### **Transitions**

-   `INIT → RUNNING_A|RUNNING_B` (based on setup)
-   `RUNNING_A → RUNNING_B` (SPACE)
-   `RUNNING_B → RUNNING_A` (SPACE)
-   `RUNNING_A → RUNNING_A` (S)
-   `RUNNING_B → RUNNING_B` (S)
-   `RUNNING_* → GAME_OVER` (timer hits 0)
-   `PAUSED ↔ RUNNING_*`
-   `GAME_OVER → INIT` (reset)

------------------------------------------------------------------------

## **Offline Behavior**

-   All assets are local.
-   Must function without internet.
-   For robustness, optional PWA setup can cache all files.

------------------------------------------------------------------------

## **Development Notes**

-   No build tools required.
-   You can open `index.html` (setup screen) directly in a browser.
-   The setup screen redirects to `game.html` (main game).
-   For convenience, a lightweight dev server (like `live-server`) can
    auto-reload.

------------------------------------------------------------------------

## **Next Steps**

Once this spec is loaded into Cursor, you can start scaffolding:

1.  Create the setup screen in `index.html` and game layout in `game.html`.
2.  Add RTL styling and Hebrew text.
3.  Build the state machine and timer modules.
4.  Connect keyboard controls.
5.  Implement question loading and rendering.
