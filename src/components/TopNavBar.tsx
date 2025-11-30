interface TopNavBarProps {
  onClose?: () => void;
}

export default function TopNavBar({ onClose }: TopNavBarProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200/80 dark:border-slate-700/80 p-4 shrink-0">
      <div className="flex items-center gap-3 text-text-light dark:text-text-dark">
        <div className="size-6 text-primary">
          <svg
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <h2 className="text-lg text-red-600 font-bold tracking-tight">
          Asistente Appio
        </h2>
      </div>
      <button
        onClick={onClose}
        className="flex items-center justify-center size-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-600/50 text-text-muted-light dark:text-text-muted-dark transition-colors"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>
    </header>
  );
}
