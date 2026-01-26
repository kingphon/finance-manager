/**
 * Pixel Mascot - A cute 8-bit creature that reacts to financial events.
 */
import { useState, useEffect } from "react";

type MascotMood = "idle" | "happy" | "sad" | "excited" | "sleeping";

interface PixelMascotProps {
  mood?: MascotMood;
  message?: string;
  size?: "sm" | "md" | "lg";
}

const MASCOT_FACES: Record<MascotMood, string> = {
  idle: "(^.^)",
  happy: "(^o^)",
  sad: "(;_;)",
  excited: "(>w<)",
  sleeping: "(-.-) zzZ",
};

const MASCOT_MESSAGES: Record<MascotMood, string[]> = {
  idle: [
    "Ready to track!",
    "What's the plan?",
    "Let's save!",
  ],
  happy: [
    "Nice savings!",
    "Ka-ching!",
    "You got this!",
    "Great job!",
  ],
  sad: [
    "Ouch, big expense...",
    "Budget time?",
    "It happens...",
  ],
  excited: [
    "WOW! Big income!",
    "LEVEL UP!",
    "AMAZING!",
  ],
  sleeping: [
    "No activity...",
    "Taking a nap...",
  ],
};

export function PixelMascot({ mood = "idle", message, size = "md" }: PixelMascotProps) {
  const [currentMessage, setCurrentMessage] = useState(message || "");
  const [isBlinking, setIsBlinking] = useState(false);

  // Random message if none provided
  useEffect(() => {
    if (!message) {
      const messages = MASCOT_MESSAGES[mood];
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    } else {
      setCurrentMessage(message);
    }
  }, [mood, message]);

  // Blinking animation
  useEffect(() => {
    if (mood === "sleeping") return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [mood]);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const face = isBlinking && mood !== "sleeping" ? "(-.-)" : MASCOT_FACES[mood];

  return (
    <div className={`flex items-end gap-2 ${sizeClasses[size]}`}>
      {/* Mascot body */}
      <div className="relative">
        {/* Cat ears */}
        <div className="flex justify-center gap-3 -mb-1">
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-primary" />
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-primary" />
        </div>
        {/* Face container */}
        <div
          className={`
            px-3 py-2 bg-primary border-[3px] border-border
            shadow-[3px_3px_0_0_hsl(var(--border))]
            font-['Press_Start_2P'] text-xs text-primary-foreground
            ${mood === "excited" ? "animate-bounce" : ""}
            ${mood === "sleeping" ? "opacity-70" : ""}
          `}
        >
          {face}
        </div>
        {/* Mood indicator */}
        {mood === "happy" && (
          <div className="absolute -top-1 -right-1 text-xs animate-bounce">
            <span className="pixel-star" />
          </div>
        )}
        {mood === "excited" && (
          <div className="absolute -top-2 -right-2 text-xs">
            <span className="pixel-coin animate-coin" />
          </div>
        )}
      </div>

      {/* Speech bubble */}
      <div className="relative">
        {/* Bubble pointer */}
        <div className="absolute left-0 bottom-2 w-0 h-0 border-t-[6px] border-r-[8px] border-b-[6px] border-t-transparent border-r-border border-b-transparent -ml-2" />
        <div className="absolute left-0 bottom-2 w-0 h-0 border-t-[5px] border-r-[7px] border-b-[5px] border-t-transparent border-r-card border-b-transparent -ml-[6px]" />
        {/* Bubble */}
        <div
          className="
            px-3 py-2 bg-card border-[2px] border-border
            font-['VT323'] text-sm text-foreground
            max-w-[150px]
          "
        >
          {currentMessage}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to determine mascot mood based on transaction type
 */
export function useMascotMood(lastTransactionType?: "income" | "expense", amount?: number): MascotMood {
  const [mood, setMood] = useState<MascotMood>("idle");

  useEffect(() => {
    if (!lastTransactionType) {
      setMood("idle");
      return;
    }

    if (lastTransactionType === "income") {
      setMood(amount && amount > 1000 ? "excited" : "happy");
    } else {
      setMood(amount && amount > 500 ? "sad" : "idle");
    }

    // Reset to idle after a few seconds
    const timeout = setTimeout(() => setMood("idle"), 5000);
    return () => clearTimeout(timeout);
  }, [lastTransactionType, amount]);

  return mood;
}
