import { IMessage } from "@/types/chat";
import UserChatBubble from "./UserChatBubble";
import AssistantChatBubble from "./AssistantChatBubble";

interface MessageBubbleProps {
  message: string;
  messageId?: string;
  afterSender: "user" | "assistant" | null;
  sender: "user" | "assistant";
  senderName?: string;
  avatarUrl?: string;
  data?: IMessage["data"];
}

export default function MessageBubble({
  afterSender,
  messageId,
  message,
  sender,
  senderName = sender === "assistant" ? "Restaurante" : "Tú",
  avatarUrl,
  data,
}: MessageBubbleProps) {
  if (sender === "user") {
    return (
      <UserChatBubble
        afterSender={afterSender}
        message={message}
        senderName={senderName}
        avatarUrl={avatarUrl}
      />
    );
  }

  return (
    <AssistantChatBubble
      afterSender={afterSender}
      message={message}
      messageId={messageId}
      senderName={senderName}
      avatarUrl={avatarUrl}
      data={data}
    />
  );
}
