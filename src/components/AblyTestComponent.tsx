"use client";

import { useState } from "react";
import { useAbly, useAblyPublish } from "@/hooks/useAbly";

/**
 * Componente de ejemplo para probar Ably
 * Este componente muestra cómo usar Ably para mensajería en tiempo real
 */
export default function AblyTestComponent() {
  const [message, setMessage] = useState("");
  const channelName = "test-channel";

  // Hook para escuchar mensajes
  const { messages, isConnected, clearMessages } = useAbly(
    channelName,
    "test-message"
  );

  // Hook para publicar mensajes
  const { publish } = useAblyPublish(channelName);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await publish("test-message", {
        text: message,
        timestamp: new Date().toISOString(),
      });
      setMessage("");
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Ably Test - Real-time Messaging
      </h2>

      {/* Estado de conexión */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
        </span>
      </div>

      {/* Lista de mensajes */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg h-64 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Mensajes ({messages.length})</h3>
          <button
            onClick={clearMessages}
            className="text-sm text-blue-600 hover:underline"
          >
            Limpiar
          </button>
        </div>
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">
            No hay mensajes aún. Envía uno para probar!
          </p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="mb-2 p-2 bg-white rounded shadow-sm">
              <p className="text-sm text-gray-600">
                {new Date(msg.data.timestamp).toLocaleTimeString()}
              </p>
              <p>{msg.data.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Input para enviar mensajes */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || !message.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Enviar
        </button>
      </div>

      {/* Instrucciones */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold mb-2">📝 Instrucciones:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>
            Asegúrate de tener configurada la variable{" "}
            <code className="bg-yellow-100 px-1 rounded">
              NEXT_PUBLIC_ABLY_API_KEY
            </code>{" "}
            en tu .env
          </li>
          <li>Abre esta página en dos pestañas diferentes</li>
          <li>Envía mensajes desde una pestaña</li>
          <li>Los mensajes aparecerán en tiempo real en ambas pestañas</li>
        </ol>
      </div>
    </div>
  );
}
