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
        <span className="material-symbols-outlined text-primary dark:text-white text-sm">
          restaurant
        </span>
      </div>

      {/* Typing bubble */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <span className="sr-only">Escribiendo...</span>
          <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-400 animate-[bounce_1.4s_infinite_0ms]"></div>
          <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-400 animate-[bounce_1.4s_infinite_200ms]"></div>
          <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-400 animate-[bounce_1.4s_infinite_400ms]"></div>
        </div>
      </div>
    </div>
  );
}
