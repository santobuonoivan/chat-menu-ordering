import { IMessage } from "@/types/chat";
import ItemChat from "./ItemChat";

interface AssistantChatBubbleProps {
  message: string;
  afterSender: "user" | "assistant" | null;
  senderName?: string;
  avatarUrl?: string;
  data?: IMessage["data"];
}

export default function AssistantChatBubble({
  afterSender,
  message,
  senderName = "Asistente Appio",
  avatarUrl,
  data,
}: AssistantChatBubbleProps) {
  const defaultAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDNmKa-EkUU4XqRtnBRlyyJ_tD6KNtRHf1ETzkN_u9j8slcMXx2oPh-DbODa-9hvXgzsuKbWanRB2r0eyUO3klnXKU7Dzxm_dAVpTchJNgtVeD2UuX1Zj8vsrGRFaKoqYa3S2ez3_RWwqNZS8NartY1ePM-J48BkgaUAnYoD_Pg-Vo37_fuTLT6Z7rSfG_3yADtNcHoWl3qYX1lX3ucqnsnN4xTwTPB5jWMboZOYNpPYshT2y-o2s2xtiAWoNl4si63fykgixBuR7jl";

  return (
    <div className="flex items-start gap-3">
      <div
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 border-2 border-white dark:border-slate-600 shadow"
        style={{ backgroundImage: `url("${avatarUrl || defaultAvatarUrl}")` }}
      />
      <div className="flex flex-1 flex-col gap-2 items-start">
        {(!afterSender || afterSender !== "assistant") && (
          <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium">
            {senderName}
          </p>
        )}

        {/* Mensaje de texto */}
        <div className="text-sm font-normal leading-relaxed flex max-w-xs rounded-lg rounded-bl-sm px-4 py-3 bg-slate-100 dark:bg-slate-700 text-text-light dark:text-text-dark shadow-sm">
          {message}
        </div>

        {/* Renderizar items si hay data */}
        {data && data.items && data.items.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 max-w-xs">
            {data.items.map((item, index) => (
              <ItemChat
                key={item.id || index}
                item={item}
                action={data.action}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
