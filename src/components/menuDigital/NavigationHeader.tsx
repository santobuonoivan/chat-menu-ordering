interface NavigationHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function NavigationHeader({
  title,
  onBack,
  showBackButton = true,
}: NavigationHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-6 py-3">
      {showBackButton ? (
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center p-2 text-white dark:text-white bg-[#8E2653] rounded-full hover:bg-[#7E2653] transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      ) : (
        <div className="w-10 h-10"></div>
      )}
      <div className="flex-1 text-center">
        <p className="text-[#8E2653] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          {title}
        </p>
      </div>
      <div className="w-10 h-10"></div> {/* Spacer */}
    </div>
  );
}
