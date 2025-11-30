interface MessageBubbleProps {
  message: string;
  afterSender: "user" | "assistant" | null;
  sender: "user" | "assistant";
  senderName?: string;
  avatarUrl?: string;
}

export default function MessageBubble({
  afterSender,
  message,
  sender,
  senderName = sender === "assistant" ? "Asistente Wineture" : "Tú",
  avatarUrl,
}: MessageBubbleProps) {
  const defaultAvatarUrl =
    sender === "assistant"
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDNmKa-EkUU4XqRtnBRlyyJ_tD6KNtRHf1ETzkN_u9j8slcMXx2oPh-DbODa-9hvXgzsuKbWanRB2r0eyUO3klnXKU7Dzxm_dAVpTchJNgtVeD2UuX1Zj8vsrGRFaKoqYa3S2ez3_RWwqNZS8NartY1ePM-J48BkgaUAnYoD_Pg-Vo37_fuTLT6Z7rSfG_3yADtNcHoWl3qYX1lX3ucqnsnN4xTwTPB5jWMboZOYNpPYshT2y-o2s2xtiAWoNl4si63fykgixBuR7jl"
      : "";

  if (sender === "user") {
    return (
      <div className="flex items-end gap-3 justify-end">
        <div className="flex flex-1 flex-col gap-2 items-end">
          {(!afterSender || afterSender !== sender) && (
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

  return (
    <div className="flex items-end gap-3">
      <div
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 border-2 border-white dark:border-slate-600 shadow"
        style={{ backgroundImage: `url("${avatarUrl || defaultAvatarUrl}")` }}
      />
      <div className="flex flex-1 flex-col gap-2 items-start">
        {(!afterSender || afterSender !== sender) && (
          <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium">
            {senderName}
          </p>
        )}
        <p className="text-sm font-normal leading-relaxed flex max-w-xs rounded-lg rounded-bl-sm px-4 py-3 bg-slate-100 dark:bg-slate-700 text-text-light dark:text-text-dark shadow-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
