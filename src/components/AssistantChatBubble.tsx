import { IMessage } from "@/types/chat";
import ItemChatCard from "./ItemChatCard";
import { useChatStore } from "@/stores/chatStore";
import ModifierChatCard from "./modifierChatCard";
import { IMenuItem } from "@/types/menu";

interface AssistantChatBubbleProps {
  message: string;
  messageId?: string;
  afterSender: "user" | "assistant" | null;
  senderName?: string;
  avatarUrl?: string;
  data?: IMessage["data"];
}

export default function AssistantChatBubble({
  afterSender,
  messageId,
  message,
  senderName = "Restaurante",
  avatarUrl,
  data,
}: AssistantChatBubbleProps) {
  const { setItemListUUID, itemListUUID } = useChatStore();
  const defaultAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDNmKa-EkUU4XqRtnBRlyyJ_tD6KNtRHf1ETzkN_u9j8slcMXx2oPh-DbODa-9hvXgzsuKbWanRB2r0eyUO3klnXKU7Dzxm_dAVpTchJNgtVeD2UuX1Zj8vsrGRFaKoqYa3S2ez3_RWwqNZS8NartY1ePM-J48BkgaUAnYoD_Pg-Vo37_fuTLT6Z7rSfG_3yADtNcHoWl3qYX1lX3ucqnsnN4xTwTPB5jWMboZOYNpPYshT2y-o2s2xtiAWoNl4si63fykgixBuR7jl";

  const getItemList = (items: IMenuItem[], action: string) => {
    setItemListUUID?.(messageId || "");
    return (
      <div className="flex flex-col gap-2 mt-2 max-w-xs">
        {items.map((item, index) => (
          <ItemChatCard
            key={item.dish_id || index}
            item={item}
            action={action}
          />
        ))}
      </div>
    );
  };
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
        {itemListUUID == messageId &&
          data &&
          data.items &&
          data.items.length > 0 &&
          getItemList(data.items, data.action || "")}
        {/* Renderizar ModifierChatCard si hay data de modificadores */}
        {itemListUUID == messageId &&
          data &&
          data.modifiers &&
          data.modifiers.length > 0 &&
          data.itemSelected && (
            <div className="flex flex-col gap-2 mt-2 max-w-xs">
              <ModifierChatCard
                item={data.itemSelected}
                modifiers={data.modifiers}
                action={data.action || ""}
              />
            </div>
          )}
      </div>
    </div>
  );
}
