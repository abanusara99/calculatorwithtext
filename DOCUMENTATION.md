# Calculator With Text - Project Documentation

## 1. Project Overview

Calculator With Text is a dynamic and responsive web-based calculator application built with Next.js and React. Its primary feature is the real-time conversion of numerical expressions and results into written words, supporting both the International (Millions, Billions) and Indian (Lakhs, Crores) numbering systems.

The interface is designed to be intuitive and accessible, allowing input via both on-screen buttons and direct keyboard entry. It also includes a text-to-speech feature to help users with pronunciation. The calculator is styled for a clean, modern look and is fully responsive, ensuring a seamless experience on desktops, tablets, and mobile devices.

**Why create Calculator with text ?**

Calculator with text for kids and people who have hard time in reading the numbers in text format. My personal experience, I mostly read upto thousand (1000) , I confuse inbetween international/ worldwide system and indian system and I failed to pronounce. I wanted kids and people to read and use calculator for both calculation and pronunciation. I hope you will like and support me.

## 2. How It Works

The application's logic is primarily contained within the `src/components/calculator.tsx` component.

### Core Functionality

*   **State Management**: The calculator's state (current expression, result, and number system) is managed using React's `useState` hooks.
    *   `expression`: Stores the current mathematical expression as a string.
    *   `result`: Stores the calculated result. When this is not `null`, the calculator is in a "result shown" state.
    *   `numberSystem`: Toggles between `'international'` and `'indian'`.

*   **Number to Text Conversion**:
    *   The core logic resides in the `numberToWords` and `expressionToWords` functions within `calculator.tsx`.
    *   These functions are self-contained and do not rely on external APIs.
    *   `convertThreeDigit`: A helper that converts numbers from 0-999 into words.
    *   `numberToWords`: Takes a number string and the selected `system` ('indian' or 'international'). It splits the number into chunks (groups of 3 for international, alternating 3 and 2 for Indian) and applies the appropriate unit names (e.g., "thousand," "lakh," "million").
    *   `expressionToWords`: Splits the entire expression by operators (`+`, `−`, `×`, `/`, `%`) and converts each part—both numbers and operators—into its corresponding word form (e.g., "added by", "multiplied by").

*   **Text-to-Speech**:
    *   The calculator uses the **Web Speech API**, a standard feature built directly into modern web browsers (like Chrome, Safari, and Firefox). This means it is completely free, works offline, and does not rely on any external services.
    *   The `handleSpeak` function is triggered by the speaker button (🔊). It reads the current expression or result aloud. A clear, high-quality voice is automatically selected by the browser, and the speech rate is slightly slowed for better comprehension and pronunciation practice.
    *   To ensure maximum reliability, the implementation includes specific error handling to prevent common issues like skipped words or audio cut-offs.

*   **Input Handling**:
    *   **On-screen Buttons**: Each button has an `onClick` handler that calls functions like `handleCharacterInsert`, `handleEquals`, `handleClear`, etc.
    *   **Keyboard Input**: The `handleKeyDown` and `handleInputChange` functions manage keyboard interactions.
        *   It sanitizes input to allow only numbers and valid mathematical symbols.
        *   It ensures that typing a number when the display is "0" replaces the "0" instead of prepending it.
        *   It allows full cursor movement, deletion, and editing within the input field.

*   **Display Logic**:
    *   The `getDisplayExpression` function formats the output. If a result is present, it formats the string as `expression = result` (e.g., "2 + 2 = 4").
    *   `formatNumberWithCommas` applies comma separators according to the selected number system.

### Component Structure

*   `src/app/page.tsx`: The main page component. It renders the `Calculator` component and provides the main layout and headings.
*   `src/components/calculator.tsx`: The heart of the application. It contains all the logic for calculation, state management, and rendering of the calculator UI.
*   `src/components/ui/`: Contains reusable UI components from `shadcn/ui` like `Button`, `Card`, and `Separator`, which are used to build the calculator's interface.

## 3. Common Errors & Troubleshooting

Throughout development, several key issues were identified and resolved.

### Speech API Reliability Issues
*   **Symptom**: When clicking the speak button, the first word of a long number was sometimes skipped (e.g., "million" instead of "eight million"). On the other hand, single-digit numbers were either silent on the first click or produced a short audio "blip" (sounding like "darr" or "dam").
*   **Cause**: These issues were caused by a classic **race condition**. The user's click to "speak" was racing against React's internal process of updating the display text. The speak function would sometimes trigger before the component's state had updated, causing it to read old or incomplete data. The audio "blips" were the result of the speech being initiated and then almost instantly cancelled by a subsequent component re-render, leaving only a few milliseconds of sound.
*   **Resolution**: The logic was refactored to be fully robust against timing issues. The final, stable solution involves three key parts within the `handleSpeak` function:
    1.  **Immediate Cancellation**: It always calls `window.speechSynthesis.cancel()` at the very beginning. This clears any pending or active speech queue and prevents audio from overlapping or getting stuck.
    2.  **Stable Reference**: A reference to the `SpeechSynthesisUtterance` object is stored in a `useRef` hook for the duration of the speech. This is crucial because it prevents the browser's garbage collector from prematurely cleaning up the object and cutting off the audio, especially on longer numbers.
    3.  **On-Demand Calculation**: The text to be spoken is calculated *directly inside the handler* at the moment of the click. It does not rely on React's state variables for the text. This completely eliminates the race condition, ensuring the function always has the most up-to-date expression and result.

### Hydration Mismatch Error

*   **Symptom**: A React warning in the developer console: `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.` The error often pointed to an attribute like `bis_skin_checked="1"`.
*   **Cause**: This error occurs during Server-Side Rendering (SSR) when a browser extension (like Grammarly) modifies the HTML of the page *after* it's been sent from the server but *before* React has fully loaded on the client. This creates a mismatch between what React expected to find and what it actually found in the browser's DOM.
*   **Resolution**: The issue was resolved by ensuring the interactive `Calculator` component is rendered only on the client-side. A `hasMounted` state was introduced. Initially, a static loading skeleton is rendered. A `useEffect` hook then sets `hasMounted` to `true`, which triggers a re-render and displays the full, interactive calculator. This prevents the initial server-client mismatch.

### Input Logic Quirks

*   **Symptom 1**: Typing a number like "796" when the display showed "0" resulted in "0796".
*   **Resolution 1**: The `handleCharacterInsert` and `handleKeyDown` functions were updated to check if the current `expression` is '0'. If it is, the '0' is replaced by the new character instead of being appended to.

*   **Symptom 2**: The keyboard input was not working or was behaving inconsistently.
*   **Resolution 2**: The input logic was refactored to centralize handling in `handleKeyDown` and `handleInputChange`. A `readOnly` prop was incorrectly added and later removed to restore editability. The logic was also refined to prevent default browser actions for valid keys and allow the component's state to be the single source of truth.

### Display Inconsistency

*   **Symptom**: After pressing the `=` button, the display would only show the result (e.g., "4") instead of the full equation ("2 + 2 = 4").
*   **Resolution**: The display logic was consolidated into the `getDisplayExpression` function. This function now explicitly checks if the calculator is in a "result shown" state (`result !== null`) and formats the output string accordingly, ensuring the full equation is always displayed post-calculation.

### Percentage Calculation Errors

*   **Symptom 1**: Performing a calculation involving multiple percentages (e.g., `10% * 10%`) resulted in an error or incorrect output. The `%` symbol was not being correctly interpreted as a division by 100 within the mathematical expression.
*   **Resolution 1**: The `handleEquals` function was updated to correctly parse percentage values. It now uses a regular expression to find numbers followed by a `%` sign and replaces them with the equivalent mathematical expression (e.g., `10%` becomes `(10/100)`), ensuring they are evaluated correctly by the JavaScript engine.

*   **Symptom 2**: Pressing the `=` button after entering an expression ending with a `%` (e.g., `50%`) did nothing. The calculator incorrectly considered the expression incomplete.
*   **Resolution 2**: The validation logic within the `handleEquals` function was adjusted. It previously prevented calculation if the expression ended with an operator, and it was mistakenly treating `%` as such. The check was refined to allow expressions ending in the percent symbol to be evaluated, correctly treating them as valid numbers.
