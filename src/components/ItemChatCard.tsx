import { useChatStore } from "@/stores/chatStore";
import { IMenuItem, IModifier } from "@/types/menu";
import { generateUUID, sleep } from "@/utils";
import { useState } from "react";

interface ItemChatProps {
  item: IMenuItem;
  action: string;
  selectedQuantity?: number;
  onAdd?: (item: IMenuItem) => void;
  onRemove?: (dishId: number) => void;
  onUpdateQuantity?: (dishId: number, delta: number) => void;
}

export default function ItemChatCard({
  item,
  action,
  selectedQuantity = 0,
  onAdd,
  onRemove,
  onUpdateQuantity,
}: ItemChatProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-sm transition-shadow w-full cursor-pointer"
      >
        {/* Imagen del producto */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0">
          <img
            src={item.image || ""}
            alt={item.dish_name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {item.dish_name}
          </h4>
          <p className="text-sm font-semibold text-[#8E2653]">
            ${item.dish_price.toLocaleString()}
          </p>
        </div>

        {/* Botón de acción o botonera de cantidad - ancho fijo */}
        <div className="w-[100px] flex justify-end shrink-0">
          {selectedQuantity > 0 ? (
            // Botonera cuando está seleccionado
            <div className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-full border border-gray-200 dark:border-slate-600 px-1 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity?.(item.dish_id, -1);
                }}
                className="flex items-center justify-center w-6 h-6 rounded-full text-[#8E2653] hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                title="Quitar uno"
              >
                <span className="material-symbols-outlined text-sm">
                  remove
                </span>
              </button>

              <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[20px] text-center">
                {selectedQuantity}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity?.(item.dish_id, 1);
                }}
                className="flex items-center justify-center w-6 h-6 rounded-full text-[#8E2653] hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                title="Agregar uno más"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          ) : (
            // Botón "+" cuando no está seleccionado
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.(item);
              }}
              className="flex items-center justify-center w-8 h-8 bg-[#8E2653] hover:bg-[#7E2653] text-white rounded-full transition-colors"
              title="Agregar al carrito"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de descripción */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.dish_name}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {item.image && (
              <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                <img
                  src={item.image}
                  alt={item.dish_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {item.description || "Sin descripción disponible"}
            </p>

            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-[#8E2653]">
                ${item.dish_price.toLocaleString()}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd?.(item);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-[#8E2653] hover:bg-[#7E2653] text-white rounded-lg transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
