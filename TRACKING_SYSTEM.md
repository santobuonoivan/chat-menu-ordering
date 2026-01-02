# Sistema de Tracking y Analytics

Sistema profesional de captura de eventos y análisis de comportamiento de usuarios.

## Arquitectura

### Componentes Principales

1. **EventTracker Service** (`src/services/eventTracker.ts`)

   - Singleton que gestiona todos los eventos
   - Buffer inteligente que acumula hasta 50 eventos
   - Envío automático cada 30 segundos
   - Retry automático (hasta 3 intentos)
   - Persistencia en localStorage si falla el envío
   - Recuperación automática de eventos fallidos

2. **Hook useTracking** (`src/hooks/useTracking.ts`)

   - Interface fácil para trackear desde componentes
   - Auto-tracking de cambios de ruta
   - Métodos específicos para cada tipo de evento

3. **Error Boundary** (`src/components/ErrorBoundary.tsx`)

   - Captura errores de React con contexto completo
   - Incluye user journey y estado de stores
   - UI de fallback profesional

4. **API Endpoint** (`src/app/api/tracking/batch/route.ts`)
   - Recibe lotes de eventos
   - Validación básica
   - Lista para conectar con backend de analytics

## Tipos de Eventos Capturados

### 1. PAGE_VIEW

Navegación entre páginas

```typescript
{
  path: "/menu",
  title: "Menú Digital",
  params: { restId: "123" }
}
```

### 2. USER_ACTION

Interacciones del usuario

```typescript
{
  action: "click",
  target: "add-to-cart-button",
  value: { itemId: "456" },
  context: { source: "menu-digital" }
}
```

### 3. API_CALL

Llamadas a APIs

```typescript
{
  endpoint: "/api/standar/getMenu",
  method: "POST",
  status: 200,
  duration: 234, // ms
  success: true
}
```

### 4. CART_ACTION

Acciones del carrito

```typescript
{
  action: "add",
  itemId: "789",
  itemName: "Pizza Margarita",
  quantity: 2,
  price: 150,
  modifiers: [...],
  cartTotal: 300,
  cartItemCount: 2
}
```

### 5. CHAT_MESSAGE

Mensajes del chat

```typescript
{
  sender: "user",
  messageId: "uuid",
  messageLength: 45,
  hasData: true,
  dataType: "items"
}
```

### 6. PAYMENT_FLOW

Proceso de pago

```typescript
{
  step: "payment_method",
  paymentMethod: "card",
  amount: 300,
  status: "pending"
}
```

### 7. ERROR

Errores con contexto completo

```typescript
{
  errorMessage: "Cannot read property 'x' of undefined",
  errorStack: "...",
  errorType: "runtime",
  componentStack: "...",
  userJourney: ["PAGE_VIEW:/menu", "USER_ACTION:click-add-to-cart", ...],
  storeState: { cart: {...}, session: {...} },
  severity: "critical"
}
```

## Uso

### En Componentes React

```typescript
import { useTracking } from "@/hooks/useTracking";

function MyComponent() {
  const { trackUserAction, trackError } = useTracking();

  const handleClick = () => {
    trackUserAction("click", "promo-banner", { bannerId: "123" });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Tracking Manual

```typescript
import { eventTracker } from "@/services/eventTracker";
import { generateUUID } from "@/utils";

eventTracker.track({
  id: generateUUID(),
  type: "USER_ACTION",
  category: "interaction",
  data: {
    action: "scroll",
    target: "menu-list",
    value: { scrollPosition: 500 },
  },
});
```

### Trackear Llamadas API

```typescript
import { trackedFetch } from "@/lib/trackedFetch";

// Automáticamente trackea la llamada
const response = await trackedFetch("/api/orders", {
  method: "POST",
  body: JSON.stringify(order),
});
```

## Metadata Automática

Cada evento incluye automáticamente:

- **sessionId**: UUID único por sesión de navegador
- **userId**: Teléfono del cliente (si está disponible)
- **restaurantId**: ID del restaurante actual
- **cartId**: ID del carrito activo
- **timestamp**: Milisegundos desde epoch
- **deviceInfo**:
  - userAgent
  - viewport (width/height)
  - platform
  - language
  - timezone
- **currentRoute**: Ruta actual
- **previousRoute**: Ruta anterior
- **referrer**: Origen de la visita

## Configuración

```typescript
import { eventTracker } from "@/services/eventTracker";

eventTracker.updateConfig({
  enabled: true,
  batchSize: 50, // Eventos antes de enviar
  flushInterval: 30000, // ms entre envíos (30s)
  maxRetries: 3, // Reintentos si falla
  retryDelay: 2000, // ms entre reintentos
  enableLocalStorage: true, // Backup local
  debugMode: false, // Logs en consola
});
```

## Integración con Backend

### Conectar API Endpoint

Edita `/src/app/api/tracking/batch/route.ts`:

```typescript
const response = await fetch(process.env.ANALYTICS_API_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.ANALYTICS_API_KEY}`,
  },
  body: JSON.stringify(batch),
});
```

### Variables de Entorno

Agrega a `.env.local`:

```bash
ANALYTICS_API_URL=https://analytics.tu-backend.com/events
ANALYTICS_API_KEY=tu_api_key_secreta
```

## Ejemplos de Uso

### Trackear Click en Botón

```typescript
const { trackUserAction } = useTracking();

<button
  onClick={() =>
    trackUserAction("click", "checkout-button", { amount: cartTotal })
  }
>
  Pagar
</button>;
```

### Trackear Paso de Pago

```typescript
const { trackPaymentFlow } = useTracking();

const handlePaymentMethod = (method: string) => {
  trackPaymentFlow("payment_method", {
    paymentMethod: method,
    amount: total,
    status: "pending",
  });
};
```

### Trackear Error Personalizado

```typescript
const { trackError } = useTracking();

try {
  // código que puede fallar
} catch (error) {
  trackError(error.message, "api", {
    severity: "high",
    context: { orderId, userId },
  });
}
```

## User Journey

El sistema mantiene automáticamente un historial de las últimas 20 acciones del usuario. Esto es especialmente útil cuando ocurren errores:

```typescript
[
  "PAGE_VIEW:/",
  "USER_ACTION:click-menu-button",
  "PAGE_VIEW:/menu",
  "USER_ACTION:select-item:Pizza",
  "CART_ACTION:add",
  "ERROR:Cannot process payment",
];
```

## Características Avanzadas

### Flush Manual

```typescript
import { eventTracker } from "@/services/eventTracker";

// Forzar envío inmediato
await eventTracker.flush(true);
```

### Estadísticas de Sesión

```typescript
import { useTrackingStore } from "@/stores/trackingStore";

const { getStats } = useTrackingStore();
const stats = getStats();
console.log(stats);
// { sessionId: "...", journeyLength: 15, bufferSize: 3 }
```

### Deshabilitar Temporalmente

```typescript
import { useTrackingStore } from "@/stores/trackingStore";

const { setEnabled } = useTrackingStore();
setEnabled(false); // Pausar tracking
```

## Debugging

En desarrollo, activa el modo debug:

```typescript
eventTracker.updateConfig({ debugMode: true });
```

Verás logs en consola:

```
[EventTracker] Event tracked: { type: "USER_ACTION", ... }
[EventTracker] Flushing 15 events
[EventTracker] Batch sent successfully: batch-uuid
```

## Rendimiento

- **Sin impacto**: Eventos se acumulan en memoria
- **Envío eficiente**: Por lotes cada 30s
- **No bloqueante**: Fetch asíncrono
- **Backup automático**: No se pierden eventos
- **Limpieza automática**: Solo últimos 10 batches fallidos

## Notas Importantes

1. El tracking se inicializa automáticamente con el hook `useTracking()`
2. Los eventos se envían antes de cerrar la ventana (beforeunload)
3. Los errores críticos fuerzan flush inmediato
4. La API de batch está lista para recibir pero debes conectar tu backend
5. En stores (cart, chat) el tracking está integrado automáticamente
