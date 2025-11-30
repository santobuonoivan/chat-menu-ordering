interface UserChatBubbleProps {
  message: string;
  afterSender: "user" | "assistant" | null;
  senderName?: string;
  avatarUrl?: string;
}

export default function UserChatBubble({
  afterSender,
  message,
  senderName = "Tú",
  avatarUrl,
}: UserChatBubbleProps) {
  return (
    <div className="flex items-end gap-3 justify-end">
      <div className="flex flex-1 flex-col gap-2 items-end">
        {(!afterSender || afterSender !== "user") && (
          <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium">
            {senderName}
          </p>
        )}
        <p className="text-sm font-normal leading-relaxed flex max-w-xs rounded-lg rounded-br-sm px-4 py-3 bg-green-900 text-white shadow-sm">
          {message}
        </p>
      </div>
      {avatarUrl && (
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 border-2 border-white dark:border-slate-600 shadow"
          style={{ backgroundImage: `url("${avatarUrl}")` }}
        />
      )}
    </div>
  );
}
