"use client";

import { useRouter } from "next/navigation";
import TopNavBar from "@/components/menuDigital/TopNavBar";
import MessageBubble from "@/components/MessageBubble";
import ActionChips from "@/components/menuDigital/ActionChips";
import MessageComposer from "@/components/MessageComposer";
import { IMessage } from "@/types/chat";
import { useChatStore } from "@/stores/chatStore";
import { useSessionStore } from "@/stores/sessionStore";
import { generateUUID, groupModifiers, sleep } from "@/utils";
import { use, useEffect, useState, useRef } from "react";
import { useMenuStore } from "@/stores/menuStore";
import { IMenuItem } from "@/types/menu";

export default function Home() {
  const router = useRouter();
  const { messages, addMessage } = useChatStore();
  const { setMenuData } = useMenuStore();
  const {
    clientPhone,
    setClientPhone,
    restPhone,
    setRestPhone,
    sessionData,
    setSessionData,
  } = useSessionStore();
  const [restNumber, setRestNumber] = useState("");

  // Refs y estados para control de scroll
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousMessageCountRef = useRef(0);

  // Detectar si estamos al final del scroll
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px de tolerancia
    setIsAtBottom(atBottom);
  };

  // Hacer scroll al final
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setIsAtBottom(true);
      setUnreadCount(0);
    }
  };

  // Control de auto-scroll cuando llega un nuevo mensaje
  useEffect(() => {
    const newMessageCount = messages.length;

    // Si hay nuevo mensaje
    if (newMessageCount > previousMessageCountRef.current) {
      previousMessageCountRef.current = newMessageCount;

      // Si estamos al final, hacer auto-scroll
      if (isAtBottom) {
        setTimeout(() => {
          scrollToBottom();
        }, 0);
      } else {
        // Si no estamos al final, incrementar contador de no leídos
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isAtBottom]);

  /** Tomar de la URL y obtener session data */
  useEffect(() => {
    const loadSessionData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const restNumberParam = urlParams.get("phone");
      const clientNumberParam = urlParams.get("client_phone");

      // Guardar números de teléfono
      if (clientNumberParam) setClientPhone(clientNumberParam);
      if (restNumberParam) setRestPhone(restNumberParam);

      // Obtener datos de sesión
      const payload = {
        user_phone: clientNumberParam || "",
        rest_phone: restNumberParam || "",
        sessionId: `${clientNumberParam || ""}||${restNumberParam || ""}`,
        chatInput: "Iniciar conversación",
        customer_name: "Customer Name",
        platform: "evolution",
      };
      const sessionResponse = await fetch("/api/core/processIncomingMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const sessionResult = await sessionResponse.json();
      const response = {
        success: sessionResponse.ok,
        data: sessionResult.data,
      };
      console.log("Session Data Response:", response);
      // Guardar datos de sesión en el store
      if (response?.data?.rest) {
        setSessionData(response.data);
        console.log(response.data.cart);
      }

      if (restNumberParam) setRestNumber(restNumberParam);
      console.log("Rest Number:", restNumberParam);
    };

    loadSessionData();
  }, [setClientPhone, setRestPhone, setSessionData]);

  useEffect(() => {
    if (restNumber) {
      fetch(`/api/standar/getMenu?phone=${restNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          const result = await res.json();
          return { success: res.ok, data: result.data };
        })
        .then((response) => {
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
            setMenuData({ menu, rest_id: response.data.rest_id });
          } else {
            console.error("Error fetching menu items:", response);
          }
        });
    }
  }, [restNumber]);

  const handleSendMessage = (
    message: string,
    sender: "user" | "assistant" = "user",
    messageBody?: IMessage | null
  ) => {
    const newMessage: IMessage = {
      id: generateUUID(),
      text: message,
      sender,
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
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-6 relative"
        >
          {messages.map((message, index) => {
            if (index === 0) {
              afterSender = null;
            } else {
              afterSender = messages[index - 1].sender;
            }
            return (
              <MessageBubble
                key={message.id}
                messageId={message.id}
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

          {/* Indicador de mensajes nuevos */}
          {!isAtBottom && unreadCount > 0 && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 right-8 flex items-center justify-center w-12 h-12 rounded-full bg-primary shadow-lg hover:shadow-xl transition-all active:scale-95 z-40 animate-bounce"
              style={{ backgroundColor: "#65A30D" }}
              aria-label={`${unreadCount} mensajes nuevos`}
            >
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-white text-xl">
                  arrow_downward
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </button>
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
