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
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      {showBackButton ? (
        <button
          onClick={onBack}
          className="p-2 text-gray-800 dark:text-gray-200"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      ) : (
        <div className="w-10 h-10"></div>
      )}
      <div className="flex-1 text-center">
        <p className="text-gray-800 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em]">
          {title}
        </p>
      </div>
      <div className="w-10 h-10"></div> {/* Spacer */}
    </div>
  );
}
