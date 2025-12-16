# Ably Integration - Guía de Uso

## Configuración Inicial

### 1. Variable de Entorno
Agrega tu API key de Ably al archivo `.env`:

```env
NEXT_PUBLIC_ABLY_API_KEY=tu_api_key_aqui
```

Para obtener tu API key:
1. Ve a https://ably.com/
2. Crea una cuenta o inicia sesión
3. Crea una nueva app
4. Copia tu API key desde el dashboard

---

## Uso Básico

### Escuchar Mensajes en un Canal

```typescript
import { useAbly } from "@/hooks/useAbly";

function ChatComponent() {
  const { messages, isConnected } = useAbly("chat-room", "message");

  return (
    <div>
      <p>Estado: {isConnected ? "Conectado" : "Desconectado"}</p>
      {messages.map((msg, index) => (
        <div key={index}>{msg.data}</div>
      ))}
    </div>
  );
}
```

### Publicar Mensajes

```typescript
import { useAblyPublish } from "@/hooks/useAbly";

function SendMessageComponent() {
  const { publish } = useAblyPublish("chat-room");

  const handleSend = async () => {
    await publish("message", { text: "Hola mundo!", user: "Juan" });
  };

  return <button onClick={handleSend}>Enviar</button>;
}
```

### Usar Presencia (Ver quién está conectado)

```typescript
import { useAblyPresence } from "@/hooks/useAbly";

function OnlineUsersComponent() {
  const { members, enterPresence, leavePresence } = useAblyPresence("chat-room");

  useEffect(() => {
    // Entrar al canal con información del usuario
    enterPresence({ name: "Juan", status: "online" });

    // Salir cuando se desmonte el componente
    return () => {
      leavePresence();
    };
  }, []);

  return (
    <div>
      <h3>Usuarios conectados: {members.length}</h3>
      {members.map((member, index) => (
        <div key={index}>{member.data?.name}</div>
      ))}
    </div>
  );
}
```

---

## Uso Avanzado (Sin Hooks)

### Publicar un mensaje directamente

```typescript
import { publishMessage } from "@/lib/ably";

const sendNotification = async () => {
  await publishMessage("notifications", "new-order", {
    orderId: 123,
    message: "Nueva orden recibida",
  });
};
```

### Suscribirse manualmente

```typescript
import { subscribeToChannel } from "@/lib/ably";

const unsubscribe = subscribeToChannel("orders", "new-order", (message) => {
  console.log("Nueva orden:", message.data);
});

// Cleanup
unsubscribe();
```

### Verificar estado de conexión

```typescript
import { isAblyConnected, getConnectionState } from "@/lib/ably";

if (isAblyConnected()) {
  console.log("Ably está conectado");
} else {
  console.log("Estado actual:", getConnectionState());
}
```

---

## Estructura de Archivos

```
src/
├── config/
│   └── ably.config.ts          # Configuración de Ably
├── lib/
│   └── ably.ts                 # Cliente singleton y funciones base
└── hooks/
    └── useAbly.ts              # Hooks personalizados para React
```

---

## Mejores Prácticas

1. **Usa hooks en componentes React**: `useAbly`, `useAblyPublish`, `useAblyPresence`
2. **Un canal por propósito**: Separa canales para chat, notificaciones, presencia, etc.
3. **Cleanup automático**: Los hooks se limpian automáticamente al desmontar
4. **Manejo de errores**: Siempre envuelve llamadas async en try-catch
5. **Nombres de canales**: Usa nombres descriptivos como `chat-${roomId}` o `orders-${restaurantId}`

---

## Ejemplo Completo: Chat en Tiempo Real

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAbly, useAblyPublish } from "@/hooks/useAbly";

export default function RealtimeChat({ roomId }: { roomId: string }) {
  const [inputMessage, setInputMessage] = useState("");
  const channelName = `chat-${roomId}`;
  
  // Escuchar mensajes
  const { messages, isConnected } = useAbly(channelName, "message");
  
  // Publicar mensajes
  const { publish } = useAblyPublish(channelName);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    await publish("message", {
      text: inputMessage,
      timestamp: new Date().toISOString(),
      user: "Usuario Actual",
    });

    setInputMessage("");
  };

  return (
    <div>
      <div>
        <span>Estado: {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}</span>
      </div>

      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.data.user}:</strong> {msg.data.text}
          </div>
        ))}
      </div>

      <div>
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}
```

---

## Troubleshooting

### Error: "Ably API key is not configured"
- Verifica que `NEXT_PUBLIC_ABLY_API_KEY` esté en tu `.env`
- Reinicia el servidor de desarrollo después de agregar la variable

### Mensajes no llegan
- Verifica que estés suscrito al mismo canal y evento
- Revisa la consola para errores de conexión
- Asegúrate de que tu API key tenga los permisos correctos

### Conexión se cae constantemente
- Revisa tu cuota de mensajes en Ably
- Verifica tu conexión a internet
- Revisa los logs en el dashboard de Ably

---

## Recursos

- [Documentación oficial de Ably](https://ably.com/docs)
- [Ably React Hooks](https://github.com/ably/ably-js)
- [Dashboard de Ably](https://ably.com/dashboard)
