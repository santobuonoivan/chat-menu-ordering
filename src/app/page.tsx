"use client";

import { useRouter } from "next/navigation";
import TopNavBar from "@/components/menuDigital/TopNavBar";
import MessageBubble from "@/components/MessageBubble";
import ActionChips from "@/components/menuDigital/ActionChips";
import MessageComposer from "@/components/MessageComposer";
import { IMessage } from "@/types/chat";
import { useChatStore } from "@/stores/chatStore";
import { generateUUID, groupModifiers, sleep } from "@/utils";
import { use, useEffect, useState } from "react";
import { menuService } from "@/services";
import { useMenuStore } from "@/stores/menuStore";
import { IMenuItem } from "@/types/menu";

export default function Home() {
  const router = useRouter();
  const { messages, addMessage } = useChatStore();
  const { setMenuData } = useMenuStore();
  const [restNumber, setRestNumber] = useState("");

  /** tomar de la url el uuid y restNumber */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restNumberParam = urlParams.get("phone");
    if (restNumberParam) setRestNumber(restNumberParam);
    console.log("Rest Number:", restNumberParam);
  }, []);

  useEffect(() => {
    if (restNumber) {
      menuService.getMenuItems(restNumber).then((response) => {
        if (response.success) {
          const menu = response.data.menu.map((item: IMenuItem) => {
            let modifiers =
              item.modifiers && typeof item.modifiers === "string"
                ? JSON.parse(item.modifiers)
                : [];

            modifiers = groupModifiers(modifiers);

            return {
              ...item,
              modifiers,
            };
          });

          console.log("Menu Items:", menu[0].modifiers);
          setMenuData({ menu });
        } else {
          console.error("Error fetching menu items:", response.error);
        }
      });
    }
  }, [restNumber]);

  const handleSendMessage = (
    message: string,
    messageBody?: IMessage | null
  ) => {
    const newMessage: IMessage = {
      id: generateUUID(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };
    addMessage(newMessage);

    if (message.toLowerCase() == "ver menú digital") {
      // Simular respuesta del asistente después de un breve delay
      setTimeout(() => {
        const assistantResponse: IMessage = {
          id: generateUUID(),
          text: "Gracias por tu mensaje. Te mostraré el menú digital para que puedas elegir.",
          sender: "assistant",
          timestamp: new Date(),
        };
        addMessage(assistantResponse);
      }, 1000);
    } else if (messageBody) {
      // Simular respuesta genérica del asistente
      setTimeout(() => {
        addMessage(messageBody);
      }, 1000);
    }
  };

  let afterSender: "user" | "assistant" | null = null;

  const handleChipClick = async (chip: string) => {
    handleSendMessage(chip);
    await sleep(2000);
    if (chip === "Ver Menú Digital") {
      router.push("/menu");
    }
  };

  const handleClose = () => {
    console.log("Chat cerrado");
  };

  const handleMicClick = () => {
    console.log("Micrófono activado");
  };

  const handleAttachClick = () => {
    console.log("Adjuntar archivo");
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDUS07Salyth6YzkzPu71sHz48EUBchGU_Qob9Rv9tvBpfkxpsuazuf893TmH6ISvawVOZgVqQ5PbJFsOrgDJeD8AyTbq6PKwk58C5lDrKosF--yDXSvQ01JPDezON_tgYSkVQw3o3bjehcBJBJWpAaSiaIIeeXgoQJ5AR5mZlQNezkBQhyAo42XoVWyX-KE1T6oCK-nPq5E9vpEHqdO4VCOdA0j8UwMOn_6wmSt023l69Q5Q2u-pfh2EmX-MwxID1LXPOEUGiHpK1_')`,
      }}
    >
      {/* Backdrop Blur */}
      <div className="absolute inset-0 bg-background-light/30 dark:bg-background-dark/30 backdrop-blur-md"></div>

      {/* Chat Container */}
      <div className="relative flex flex-col w-full max-w-[450px] h-[90vh] max-h-[800px] bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Top Navigation */}
        <TopNavBar onClose={handleClose} />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message, index) => {
            if (index === 0) {
              afterSender = null;
            } else {
              afterSender = messages[index - 1].sender;
            }
            return (
              <MessageBubble
                key={message.id}
                message={message.text}
                sender={message.sender}
                afterSender={afterSender}
                data={message.data}
              />
            );
          })}

          {/* Show action chips only after first assistant message and no user messages yet */}
          {messages.length === 2 && messages[0].sender === "assistant" && (
            <ActionChips chips={[]} onChipClick={handleChipClick} />
          )}
        </div>

        {/* Message Composer */}
        <MessageComposer
          onSendMessage={handleSendMessage}
          onMicClick={handleMicClick}
          onAttachClick={handleAttachClick}
        />
      </div>
    </div>
  );
}
