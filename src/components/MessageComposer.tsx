"use client";

import { useState } from "react";

interface MessageComposerProps {
  onSendMessage?: (message: string) => void;
  onMicClick?: () => void;
  onAttachClick?: () => void;
  placeholder?: string;
}

export default function MessageComposer({
  onSendMessage,
  onMicClick,
  onAttachClick,
  placeholder = "Escribe tu mensaje aquí...",
}: MessageComposerProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/80 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-full text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border-none bg-slate-200/70 dark:bg-slate-900/50 h-12 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark pl-12 pr-24 text-sm font-normal"
            placeholder={placeholder}
          />
          <div className="absolute left-0 top-0 h-full flex items-center pl-3">
            <button
              onClick={onMicClick}
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-300/50 dark:hover:bg-slate-600/50 text-text-muted-light dark:text-text-muted-dark transition-colors"
            >
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full flex items-center pr-12">
            <button
              onClick={onAttachClick}
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-300/50 dark:hover:bg-slate-600/50 text-text-muted-light dark:text-text-muted-dark transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                attach_file
              </span>
            </button>
          </div>
        </div>
        <button
          onClick={handleSend}
          className="flex items-center justify-center size-12 cursor-pointer overflow-hidden rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">
            arrow_upward
          </span>
        </button>
      </div>
    </div>
  );
}
