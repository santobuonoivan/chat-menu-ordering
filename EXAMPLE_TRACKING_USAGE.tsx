// Ejemplo: Cómo integrar tracking en un componente nuevo

"use client";

import { useTracking } from "@/hooks/useTracking";
import { useEffect, useState } from "react";

export default function ExampleTrackedComponent() {
  const { trackUserAction, trackCartAction, trackPaymentFlow, trackError } =
    useTracking();

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Ejemplo 1: Trackear clicks simples
  const handleButtonClick = () => {
    trackUserAction("click", "example-button", {
      buttonLabel: "Ordenar Ahora",
      timestamp: Date.now(),
    });
  };

  // Ejemplo 2: Trackear selección de items
  const handleItemSelect = (itemId: string, itemName: string) => {
    setSelectedItem(itemId);
    trackUserAction("select", "menu-item", {
      itemId,
      itemName,
      source: "menu-digital",
    });
  };

  // Ejemplo 3: Trackear acciones del carrito
  const handleAddToCart = async (item: any) => {
    try {
      // Lógica de agregar al carrito...

      trackCartAction("add", {
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        price: item.price,
        cartTotal: 150, // total después de agregar
        cartItemCount: 3, // items en carrito después de agregar
      });
    } catch (error: any) {
      // Trackear error si falla
      trackError(error.message, "user", {
        severity: "medium",
        context: { itemId: item.id, action: "add-to-cart" },
      });
    }
  };

  // Ejemplo 4: Trackear flujo de pago
  const handlePaymentStep = (step: string) => {
    trackPaymentFlow(step, {
      paymentMethod: "card",
      amount: 250,
      status: "pending",
    });
  };

  // Ejemplo 5: Trackear scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercent = Math.round(
      (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100
    );

    // Solo trackear cada 25%
    if (scrollPercent % 25 === 0) {
      trackUserAction("scroll", "menu-list", {
        scrollPercent,
        scrollPosition: element.scrollTop,
      });
    }
  };

  // Ejemplo 6: Trackear tiempo en página
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      trackUserAction("page-exit", "example-page", {
        durationSeconds: Math.round(duration / 1000),
      });
    };
  }, [trackUserAction]);

  return (
    <div>
      <h1>Componente con Tracking</h1>

      <button onClick={handleButtonClick}>Click aquí (tracked)</button>

      <div onScroll={handleScroll} style={{ height: 400, overflow: "auto" }}>
        {/* Contenido scrolleable */}
      </div>

      <button onClick={() => handleItemSelect("123", "Pizza")}>
        Seleccionar Pizza
      </button>

      <button
        onClick={() =>
          handleAddToCart({ id: "123", name: "Pizza", price: 150 })
        }
      >
        Agregar al Carrito
      </button>

      <button onClick={() => handlePaymentStep("payment_method")}>
        Ir a Pago
      </button>
    </div>
  );
}
