import { RiRobot3Line } from "react-icons/ri";
interface TopNavBarProps {
  onClose?: () => void;
}

export default function TopNavBar({ onClose }: TopNavBarProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200/80 dark:border-slate-700/80 p-4 shrink-0">
      <div className="flex items-center gap-3 text-text-light dark:text-text-dark">
        <div className="size-6 text-primary">
          <RiRobot3Line size={24} color="#8E2653" />
        </div>
        <h2 className="text-lg text-[#8E2653] font-bold tracking-tight">
          Asistente AI{" "}
          <span
            style={{
              fontFamily: "Comfortaa ,sans-serif",
              fontWeight: "bold",
              fontSize: 24,
            }}
          >
            {" "}
            appio
          </span>
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
