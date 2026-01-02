"use client";

import { useRouter } from "next/navigation";
import TopNavBar from "@/components/menuDigital/TopNavBar";
import MessageBubble from "@/components/MessageBubble";
import ActionChips from "@/components/menuDigital/ActionChips";
import MessageComposer from "@/components/MessageComposer";
import TypingIndicator from "@/components/TypingIndicator";
import { IMessage } from "@/types/chat";
import { useChatStore } from "@/stores/chatStore";
import { useSessionStore } from "@/stores/sessionStore";
import { generateUUID, groupModifiers, humanizedText, sleep } from "@/utils";
import { useEffect, useState, useRef } from "react";
import { useMenuStore } from "@/stores/menuStore";
import { IMenuItem } from "@/types/menu";
import { ApiCallProcessIncomingMessage } from "@/handlers/core/getSessionData";
import { ApiCallGetMenu } from "@/handlers/standar/orders";
import { useTracking } from "@/hooks/useTracking";

export default function Home() {
  const router = useRouter();
  const { trackUserAction, trackChatMessage } = useTracking();
  const {
    messages,
    addMessage,
    isAssistantTyping,
    setIsAssistantTyping,
    triggerScrollToBottom,
    setTriggerScrollToBottom,
  } = useChatStore();
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
  const [isLoading, setIsLoading] = useState(true);

  // Refs y estados para control de scroll
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousMessageCountRef = useRef(0);
  const chatInitializedRef = useRef(false);

  // Detectar si estamos al final del scroll
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px de tolerancia
    setIsAtBottom(atBottom);
  };

  useEffect(() => {
    if (messages.length === 0 && !isLoading && !chatInitializedRef.current) {
      chatInitializedRef.current = true;
      const iniciarChat = async () => {
        const initialMessages = [
          {
            id: generateUUID(),
            text: "¡Hola! ¿Cómo estás? Soy tu Asistente Digital. ¿En qué te puedo ayudar hoy? Puedes hablar conmigo para pedir algo delicioso o puedes acceder a la gestión por menú digital.",
            sender: "assistant" as const,
            timestamp: new Date(),
          },
        ];
        setIsAssistantTyping(true);
        for (const msg of initialMessages) {
          await humanizedText(msg.text)
            .then((msgHumanized) => {
              console.log("Mensaje humanizado:", msgHumanized);
              msg.text = msgHumanized.output || msg.text;
              addMessage(msg);
            })
            .catch((error) => {
              console.error("Error al humanizar el mensaje:", error);
            });
        }
        setIsAssistantTyping(false);
      };
      iniciarChat();
    }
  }, [messages.length, isLoading, addMessage, setIsAssistantTyping]);

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
    if (
      newMessageCount > previousMessageCountRef.current ||
      isAssistantTyping
    ) {
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
  }, [messages, isAtBottom, isAssistantTyping]);

  // Escuchar trigger externo para hacer scroll al final
  useEffect(() => {
    if (triggerScrollToBottom) {
      scrollToBottom();
      setTriggerScrollToBottom(false); // Reset del trigger
    }
  }, [triggerScrollToBottom, setTriggerScrollToBottom]);

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
      const sessionResponse = await ApiCallProcessIncomingMessage(payload);

      // Guardar datos de sesión en el store
      if (sessionResponse?.data?.rest) {
        setSessionData(sessionResponse.data);
        console.log(sessionResponse.data.cart);
      }

      if (restNumberParam) setRestNumber(restNumberParam);
      console.log("Rest Number:", restNumberParam);

      // Marcar como cargado
      setIsLoading(false);
    };

    loadSessionData();
  }, [setClientPhone, setRestPhone, setSessionData]);

  useEffect(() => {
    console.log("Fetching menu for rest number:", restNumber);
    if (restNumber) {
      ApiCallGetMenu(restNumber)
        .then(async (res) => {
          console.log("Get Menu Response Status:", res);
          return { success: res.status === 200, data: res.data };
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
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    }
  }, [restNumber]);

  const handleSendMessage = async (
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
    if (sender === "user") {
      setTimeout(() => {
        setIsAssistantTyping(true);
      }, 500);
    } else if (sender === "assistant") {
      setIsAssistantTyping(false);
    } /*else {
      setIsAssistantTyping(true);
      await sleep(1500);
      setIsAssistantTyping(false);
    }*/
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
      router.push(`/menu${window.location.search}`);
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

  /* ejemplo
    restNumber=5215620968350
    clientPhone=5491130881719
  */
  const validateConfiguration = (): boolean => {
    // Retorna true si TODO está CORRECTO
    if (!clientPhone || !restPhone) {
      console.log("❌ Faltan números de teléfono");
      return false;
    }

    if (restPhone.length !== 13 || !restPhone.startsWith("521")) {
      console.log("❌ Número de restaurante (MX) inválido:", restPhone);
      return false;
    }

    if (
      clientPhone.length !== 13 ||
      !["521", "549"].includes(clientPhone.slice(0, 3))
    ) {
      console.log("❌ Número de cliente inválido:", clientPhone);
      return false;
    }

    return true; // Todo correcto
  };

  return (
    <>
      {isLoading ? (
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-6xl text-[#8E2653]">
              refresh
            </span>
            <p className="text-lg font-medium text-gray-600">Cargando...</p>
          </div>
        </div>
      ) : !validateConfiguration() ? (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
          <div className="max-w-md rounded-xl bg-red-50 p-6 shadow-lg border border-red-200">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-3xl text-red-600">
                error
              </span>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Error de configuración
                </h3>
                <p className="text-red-700">
                  Se detectó un problema con la configuración inicial. Ponte en
                  contacto con el equipo de soporte.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDUS07Salyth6YzkzPu71sHz48EUBchGU_Qob9Rv9tvBpfkxpsuazuf893TmH6ISvawVOZgVqQ5PbJFsOrgDJeD8AyTbq6PKwk58C5lDrKosF--yDXSvQ01JPDezON_tgYSkVQw3o3bjehcBJBJWpAaSiaIIeeXgoQJ5AR5mZlQNezkBQhyAo42XoVWyX-KE1T6oCK-nPq5E9vpEHqdO4VCOdA0j8UwMOn_6wmSt023l69Q5Q2u-pfh2EmX-MwxID1LXPOEUGiHpK1_')`,
          }}
        >
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-background-light/30 dark:bg-[#0b141a]/90 backdrop-blur-md"></div>

          {/* Chat Container */}
          <div className="relative flex flex-col w-full max-w-[450px] h-[90vh] max-h-[800px] bg-surface-light/80 dark:bg-[#111b21]/95 backdrop-blur-xl border border-white/20 dark:border-[#2a3942]/50 rounded-xl shadow-2xl overflow-hidden">
            {/* Top Navigation */}
            <TopNavBar onClose={handleClose} />
            {/* Chat Area */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-6 relative custom-scrollbar"
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
              {messages.length === 1 && messages[0].sender === "assistant" && (
                <ActionChips chips={[]} onChipClick={handleChipClick} />
              )}

              {/* Typing Indicator */}
              <TypingIndicator isTyping={isAssistantTyping} />

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
      )}
    </>
  );
}
