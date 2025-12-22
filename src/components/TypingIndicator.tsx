"use client";

interface TypingIndicatorProps {
  isTyping: boolean;
}

export default function TypingIndicator({ isTyping }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* Avatar placeholder */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-sm">
          restaurant
        </span>
      </div>

      {/* Typing bubble */}
      <div className="max-w-[70%] bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-typing-dot animation-delay-0"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-typing-dot animation-delay-200"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-typing-dot animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
}
