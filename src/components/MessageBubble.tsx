import { IMessage } from "@/types/chat";
import UserChatBubble from "./UserChatBubble";
import AssistantChatBubble from "./AssistantChatBubble";

interface MessageBubbleProps {
  message: string;
  afterSender: "user" | "assistant" | null;
  sender: "user" | "assistant";
  senderName?: string;
  avatarUrl?: string;
  data?: IMessage["data"];
}

export default function MessageBubble({
  afterSender,
  message,
  sender,
  senderName = sender === "assistant" ? "Asistente Appio" : "Tú",
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
      senderName={senderName}
      avatarUrl={avatarUrl}
      data={data}
    />
  );
}
