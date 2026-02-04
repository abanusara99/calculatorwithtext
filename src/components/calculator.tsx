
"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Helper functions for number to text conversion
const ones = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
];
const teens = [
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const tens = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];
const operators: { [key: string]: string } = {
  "+": "added by",
  "−": "subtracted by",
  "-": "subtracted by",
  "×": "multiplied by",
  "*": "multiplied by",
  "/": "divided by",
  "%": "percent",
};

const convertThreeDigit = (num: number): string => {
  let word = "";
  if (num >= 100) {
    word += ones[Math.floor(num / 100)] + " hundred";
    num %= 100;
    if (num > 0) word += " ";
  }
  if (num >= 20) {
    word += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) word += " ";
  }
  if (num >= 10) {
    return (word + teens[num - 10]).trim();
  }
  if (num > 0) {
    word += ones[num];
  }
  return word.trim();
};

const numberToWords = (numStr: string, system: "international" | "indian"): string => {
  numStr = (numStr || "").toString().replace(/,/g, "");
  if (numStr === "0") return "zero";
  if (!numStr || isNaN(parseFloat(numStr))) return "";

  const [integerPart, decimalPart] = numStr.split(".");

  let integerWords = "";
  if (integerPart && integerPart !== "0") {
      if (system === "indian") {
          const indianUnits = ["", "thousand", "lakh", "crore"];
          let num = parseInt(integerPart, 10);
          let words = "";
          
          if (num > 0) {
              const lastThree = num % 1000;
              if (lastThree > 0) {
                  words = convertThreeDigit(lastThree);
              }
              num = Math.floor(num / 1000);
              let unitIndex = 1;
              while (num > 0) {
                  const nextTwo = num % 100;
                  if (nextTwo > 0) {
                      const unitWord = indianUnits[unitIndex] ? ` ${indianUnits[unitIndex]}` : '';
                      words = `${convertThreeDigit(nextTwo)}${unitWord} ${words}`.trim();
                  }
                  num = Math.floor(num / 100);
                  unitIndex++;
              }
          }
          integerWords = words.trim();

      } else { // international
          const internationalUnits = ["", "thousand", "million", "billion", "trillion"];
          let num = parseInt(integerPart, 10);
          let words = "";
          let unitIndex = 0;

          while (num > 0) {
              const threeDigits = num % 1000;
              if (threeDigits > 0) {
                  const unitWord = internationalUnits[unitIndex] ? ` ${internationalUnits[unitIndex]}` : '';
                  words = `${convertThreeDigit(threeDigits)}${unitWord} ${words}`.trim();
              }
              num = Math.floor(num / 1000);
              unitIndex++;
          }
          integerWords = words.trim();
      }
  }
  
  let decimalWords = "";
  if (decimalPart) {
      decimalWords = "point " + decimalPart.split("").map(digit => ones[parseInt(digit, 10)] || "zero").join(" ");
  }

  if(integerPart === "0" && decimalPart) return decimalWords.trim();

  if (integerWords && decimalWords) {
      return `${integerWords} ${decimalWords}`;
  }
  
  return (integerWords || decimalWords).trim();
};

const expressionToWords = (expr: string, system: "international" | "indian"): string => {
    const parts = expr.split(/([+\-−×*\/%])/).filter(p => p);
    
    return parts.map(part => {
        if (operators[part]) {
            return operators[part];
        }
        return numberToWords(part, system);
    }).join(" ");
};

const CalculatorButton = (props: React.ComponentProps<typeof Button>) => (
  <Button
    className={cn(
      "h-14 text-xl md:h-16 md:text-2xl font-bold rounded-lg shadow-lg transition-all duration-150 ease-in-out",
      "active:translate-y-1",
      props.className
    )}
    {...props}
  />
);

const formatNumberWithCommas = (
  numStr: string,
  system: "international" | "indian"
): string => {
  if (!numStr.trim()) return "";
  const cleanNumStr = numStr.replace(/,/g, "");
  if (isNaN(Number(cleanNumStr))) return numStr;

  const parts = cleanNumStr.split(".");
  let integerPart = parts[0];
  const fractionalPart = parts.length > 1 ? "." + parts[1] : "";

  if (integerPart) {
    if (system === "indian") {
      let lastThree = integerPart.slice(-3);
      const otherNumbers = integerPart.slice(0, -3);
      if (otherNumbers != "") {
        lastThree = "," + lastThree;
      }
      const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
      integerPart = res;
    } else {
      // International system
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  return integerPart + fractionalPart;
};

const formatExpression = (
  expr: string,
  system: "international" | "indian"
): string => {
  if (!expr) return "";
  // This regex finds numbers (including decimals) and leaves operators alone.
  return expr.replace(/([0-9,]+(?:\.[0-9]*)?)/g, (match) => {
    const cleanMatch = match.replace(/,/g, "");
    return formatNumberWithCommas(cleanMatch, system);
  });
};

export default function Calculator() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [expression, setExpression] = useState("0");
  const [result, setResult] = useState<string | null>(null);
  const [numberSystem, setNumberSystem] = useState<"international" | "indian">(
    "international"
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isResultShown = result !== null;

  const getDisplayExpression = () => {
    if (isResultShown && result !== "Error") {
      return `${formatExpression(expression, numberSystem)} = ${formatNumberWithCommas(result!, numberSystem)}`;
    }
    return formatExpression(expression, numberSystem);
  };

  // Derive textDisplay on every render for the visual part of the UI.
  let textDisplay: string;
  if (isResultShown) {
    if (result === "Error") {
      textDisplay = "Error";
    } else {
      const textualExpression = expressionToWords(expression.replace(/,/g, ''), numberSystem);
      const textualResult = numberToWords(result!, numberSystem);
      textDisplay = `${textualExpression} is ${textualResult}`;
    }
  } else {
    if (expression !== "" && expression !== "0") {
      textDisplay = expressionToWords(expression.replace(/,/g, ''), numberSystem);
    } else {
      textDisplay = "zero";
    }
  }
  
  const handleSpeak = () => {
    // Re-calculate the text to speak *directly inside the handler*.
    // This avoids race conditions with React state updates.
    let textToSay = "zero";
    if (isResultShown) {
      if (result === "Error") {
        textToSay = "Error";
      } else {
        const textualExpression = expressionToWords(expression.replace(/,/g, ''), numberSystem);
        const textualResult = numberToWords(result!, numberSystem);
        textToSay = `${textualExpression} is ${textualResult}`;
      }
    } else if (expression !== "" && expression !== "0") {
      textToSay = expressionToWords(expression.replace(/,/g, ''), numberSystem);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // 1. Cancel any ongoing speech immediately.
      window.speechSynthesis.cancel();
      
      // 2. Create the new speech instruction.
      const utterance = new SpeechSynthesisUtterance(textToSay);
      utterance.rate = 0.85; // Slightly slower for clarity.
      
      // 3. Hold a reference to the utterance to prevent it from being cut off.
      utteranceRef.current = utterance;
      utterance.onend = () => {
        // Clear the reference when speech is finished.
        utteranceRef.current = null;
      };
      
      // 4. Speak.
      window.speechSynthesis.speak(utterance);
    } else {
        alert("Sorry, your browser doesn't support text-to-speech.");
    }
  };

  const handleClear = () => {
    setExpression("0");
    setResult(null);
  };

  const handleCharacterInsert = (chars: string) => {
    setResult(null);
  
    if (isResultShown && /[+\-*/%×−]/.test(chars)) {
      setExpression(result! + chars);
    } else if (isResultShown) {
      setExpression(chars);
    } else if (expression === '0' && chars !== '.' && !/[+\-*/%×−]/.test(chars)) {
      setExpression(chars);
    } else {
      setExpression(prev => prev + chars);
    }
  };
  
  const handleEquals = () => {
    if (
      expression === "" ||
      /[\+\-\*\/×−]$/.test(expression) ||
      isResultShown
    )
      return;

    let resultValue: number;
    let formattedResult: string;

    try {
      let evalExpression = expression
        .replace(/×/g, "*")
        .replace(/−/g, "-")
        .replace(/,/g, "");

      // Handle percentages by converting "n%" to "(n/100)"
      evalExpression = evalExpression.replace(/(\d*\.?\d+)%/g, "($1/100)");
        
      if (/[^0-9.+\-*/()]/.test(evalExpression)) {
        throw new Error("Invalid characters in expression");
      }
      resultValue = new Function("return " + evalExpression)();
      if (typeof resultValue !== "number" || !isFinite(resultValue)) {
        throw new Error("Invalid calculation");
      }
      formattedResult = parseFloat(resultValue.toPrecision(15)).toString();
    } catch (e) {
      setResult("Error");
      return;
    }

    setResult(formattedResult);
  };

  const handleBackspace = () => {
    if (isResultShown) {
      handleClear();
      return;
    }
    if (expression.length > 1) {
      setExpression(expression.slice(0, -1));
    } else {
      setExpression("0");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // When result is shown, typing should start a new expression.
    // This is a fallback for `handleKeyDown`.
    if (isResultShown) {
      setResult(null);
    }
  
    let value = e.target.value;
    // When a result is shown, the input value is "expr = result". We only want the expr part.
    const equalsIndex = value.indexOf(' = ');
    if (equalsIndex > -1) {
        // This happens when onChange is fired from a state update, not user input.
        // We should take the part before the " = ".
        value = value.substring(0, equalsIndex);
    }
  
    // Sanitize by removing commas and any other disallowed characters.
    const sanitizedValue = value.replace(/,/g, '').replace(/[^0-9.+\-*/%×−]/g, '');
  
    setExpression(sanitizedValue || '0');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) {
      return;
    }
  
    // Allow navigation and modification keys to work naturally.
    const allowedKeys = [
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
      'Backspace', 'Delete', 'Tab', 'Home', 'End'
    ];
    if (allowedKeys.includes(e.key)) {
      if (e.key === 'Backspace') {
        // Prevent default backspace action, since we have a custom handler.
        e.preventDefault();
        handleBackspace();
      }
      return;
    }
    
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      handleEquals();
      return;
    }
  
    const validChar = /[0-9.+\-*/%×−]/.test(e.key);

    // Block any other single character that isn't a valid input char.
    if (e.key.length === 1 && !validChar) {
      e.preventDefault();
      return;
    }
    
    // Specific logic for when a valid character is pressed
    if (validChar) {
      e.preventDefault();
      // If result is shown, start a new expression
      if(isResultShown) {
        if (/[+\-*/%×−]/.test(e.key)) {
            setExpression(result! + e.key);
        } else {
            setExpression(e.key);
        }
        setResult(null);
      } else if (expression === '0' && e.key !== '.' && !/[+\-*/%×−]/.test(e.key)) {
        // If current expression is "0", replace it with the new number
        setExpression(e.key);
      } else {
        // For all other cases, append the character to the expression
        setExpression(prev => prev + e.key);
      }
    }
  };
  
  const buttons = [
    { children: <Volume2 />, onClick: handleSpeak, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90 col-span-1 border-4 border-black", "aria-label": "Speak Result" },
    { children: "INU", onClick: () => setNumberSystem('international'), className: "bg-gray-400 text-white font-bold hover:bg-gray-500 col-span-1 border-4 border-black", "aria-label": "World Wide System" },
    { children: "IS", onClick: () => setNumberSystem('indian'), className: "bg-gray-400 text-white font-bold hover:bg-gray-500 col-span-1 border-4 border-black", "aria-label": "Indian System" },
    { children: "C", onClick: handleClear, variant: "success" as const, "aria-label": "Clear", className: "col-span-1 border-4 border-black"},
    { children: "7", onClick: () => handleCharacterInsert("7"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "7" },
    { children: "8", onClick: () => handleCharacterInsert("8"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "8" },
    { children: "9", onClick: () => handleCharacterInsert("9"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "9" },
    { children: "/", onClick: () => handleCharacterInsert("/"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "Divide" },
    { children: "4", onClick: () => handleCharacterInsert("4"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "4" },
    { children: "5", onClick: () => handleCharacterInsert("5"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "5" },
    { children: "6", onClick: () => handleCharacterInsert("6"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "6" },
    { children: "×", onClick: () => handleCharacterInsert("×"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "Multiply" },
    { children: "1", onClick: () => handleCharacterInsert("1"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "1" },
    { children: "2", onClick: () => handleCharacterInsert("2"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "2" },
    { children: "3", onClick: () => handleCharacterInsert("3"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "3" },
    { children: "−", onClick: () => handleCharacterInsert("−"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "Subtract" },
    { children: "0", onClick: () => handleCharacterInsert("0"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "0" },
    { children: ".", onClick: () => handleCharacterInsert("."), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "Decimal" },
    { children: "%", onClick: () => handleCharacterInsert("%"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "Percent" },
    { children: "+", onClick: () => handleCharacterInsert("+"), className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "Add" },
    { children: "=", onClick: handleEquals, className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 col-span-3 border-4 border-black", "aria-label": "Equals" },
    { children: ",", onClick: () => {}, className: "bg-yellow-200 text-black font-bold hover:bg-yellow-300 border-4 border-black", "aria-label": "Comma" },
  ];

  if (!hasMounted) {
    return (
      <Card className="w-full md:w-auto md:min-w-[24rem] max-w-full bg-card shadow-2xl rounded-2xl overflow-hidden border-4 border-white/50">
        <CardContent className="p-2 md:p-4 space-y-2 md:space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-right border-4 border-black">
            <Skeleton className="h-[48px] md:h-[60px] w-full" />
            <Separator className="my-2 bg-black" />
            <Skeleton className="h-[3.5rem] w-full" />
          </div>
          <div className="grid grid-cols-4 grid-rows-6 gap-1 md:gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <Skeleton key={i} className="h-14 md:h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-auto md:min-w-[24rem] max-w-full bg-card shadow-2xl rounded-2xl overflow-hidden border-4 border-white/50">
      <CardContent className="p-2 md:p-4 space-y-2 md:space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-right border-4 border-black">
          <input
            ref={inputRef}
            type="text"
            value={getDisplayExpression()}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="font-headline text-4xl md:text-5xl font-bold text-foreground bg-transparent border-none outline-none w-full text-right p-0 min-h-[48px] md:min-h-[60px] whitespace-nowrap overflow-x-auto"
            autoFocus
          />
          <Separator className="my-2 bg-black" />
          <div className="font-body text-base md:text-lg text-muted-foreground font-bold min-h-[3.5rem] flex items-center justify-end overflow-y-auto overflow-x-hidden flex-wrap">
            <span className="break-words text-right">
              {`${
                numberSystem === "international" ? "INU" : "IS"
              }: ${textDisplay}`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 grid-rows-6 gap-1 md:gap-2">
          {buttons.map((btn) => (
            <CalculatorButton
              key={btn["aria-label"]}
              {...btn}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
    