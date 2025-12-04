"use client";

import { useState, useEffect, useRef } from "react";
import { useDeliveryStore } from "@/stores/deliveryStore";

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: DeliveryAddress) => void;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  zip: string;
  references: string;
  latitude: number;
  longitude: number;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function DeliveryAddressModal({
  isOpen,
  onClose,
  onConfirm,
}: DeliveryAddressModalProps) {
  const { address: storedAddress, setAddress: setStoredAddress } =
    useDeliveryStore();
  const [address, setAddress] = useState<DeliveryAddress>({
    street: "",
    city: "",
    zip: "",
    references: "",
    latitude: 0,
    longitude: 0,
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const geocoderInstance = useRef<any>(null);
  const mapInitialized = useRef(false);

  // Cargar dirección guardada si existe
  useEffect(() => {
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, [storedAddress]);

  // Guardar dirección en el store cada vez que cambia
  useEffect(() => {
    if (address.latitude !== 0 || address.longitude !== 0) {
      setStoredAddress(address);
    }
  }, [address, setStoredAddress]);

  // Cargar Google Maps API
  useEffect(() => {
    if (!isOpen) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error("API key de Google Maps no configurada");
          return;
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeMap();
        };
        script.onerror = () => {
          console.error("Error al cargar Google Maps API");
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();
  }, [isOpen]);

  // Inicializar mapa
  const initializeMap = () => {
    if (mapInitialized.current || !mapRef.current) return;

    mapInitialized.current = true;
    geocoderInstance.current = new window.google.maps.Geocoder();

    // Detectar ubicación actual del usuario
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          createMap(latitude, longitude);
          reverseGeocode(latitude, longitude);
        },
        () => {
          // Si falla, usar ubicación por defecto
          createMap(40.7128, -74.006);
        }
      );
    } else {
      createMap(40.7128, -74.006);
    }
  };

  const createMap = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat, lng },
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
    });

    // Crear marcador draggable
    markerInstance.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance.current,
      draggable: true,
      title: "Tu ubicación",
    });

    // Evento cuando se arrastra el marcador
    markerInstance.current.addListener("dragend", () => {
      const newPosition = markerInstance.current.getPosition();
      const newLat = newPosition.lat();
      const newLng = newPosition.lng();

      // Actualizar coordenadas
      setAddress((prev) => ({
        ...prev,
        latitude: newLat,
        longitude: newLng,
      }));

      // Obtener dirección desde las nuevas coordenadas
      reverseGeocode(newLat, newLng);

      // Centrar el mapa en la nueva posición
      mapInstance.current.setCenter({ lat: newLat, lng: newLng });
    });

    // Actualizar estado inicial
    setAddress((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  // Geocoding inverso: obtener dirección desde coordenadas
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderInstance.current) return;

    try {
      const response = await geocoderInstance.current.geocode({
        location: { lat, lng },
      });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const addressComponents = result.address_components;

        let street = "";
        let city = "";
        let zip = "";

        // Extraer componentes de dirección
        addressComponents.forEach((component: any) => {
          const types = component.types;

          if (types.includes("route")) {
            street = component.long_name;
          }
          if (types.includes("street_number")) {
            street += ` ${component.long_name}`;
          }
          if (
            types.includes("locality") ||
            types.includes("administrative_area_level_2")
          ) {
            city = component.long_name;
          }
          if (types.includes("postal_code")) {
            zip = component.long_name;
          }
        });

        setAddress((prev) => ({
          ...prev,
          street: street || result.formatted_address,
          city: city || "",
          zip: zip || "",
        }));
      }
    } catch (error) {
      console.error("Error en geocoding inverso:", error);
    }
  };

  // Geocoding: buscar dirección y mover marcador
  const searchAddress = async (query: string) => {
    if (!query.trim() || !geocoderInstance.current) return;

    try {
      const response = await geocoderInstance.current.geocode({
        address: query,
      });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const location = result.geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        // Mover marcador y mapa
        markerInstance.current.setPosition({ lat, lng });
        mapInstance.current.setCenter({ lat, lng });

        // Actualizar coordenadas
        setAddress((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        // Obtener dirección detallada
        reverseGeocode(lat, lng);
      }
    } catch (error) {
      console.error("Error en búsqueda de dirección:", error);
    }
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStreetSearch = async (value: string) => {
    handleAddressChange("street", value);
    if (value.length > 3) {
      await searchAddress(value);
    }
  };

  const handleConfirm = () => {
    if (!address.street || !address.city || !address.zip) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    onConfirm(address);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="relative flex h-full max-h-[900px] w-full max-w-[450px] flex-col overflow-hidden rounded-xl soft-shadow"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-2 p-4">
          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full text-text-light dark:text-text-dark soft-shadow transition-all active:soft-shadow-inset"
            style={{ backgroundColor: "#f3f4f6" }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-black tracking-tight text-text-light dark:text-text-dark">
            Dirección de Entrega
          </h1>
          <div className="w-12"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="flex flex-col gap-6">
            {/* Map Container */}
            <div className="relative h-48 w-full overflow-hidden rounded-lg soft-shadow">
              <div
                ref={mapRef}
                className="h-full w-full"
                style={{ backgroundColor: "#e5e7eb" }}
              />
              <div className="absolute top-2 right-2 bg-white rounded-lg shadow p-2 text-xs z-10">
                <p className="font-semibold text-gray-900">
                  {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Address Form */}
            <div className="flex flex-col gap-4">
              {/* Street Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Calle y número"
                  value={address.street}
                  onChange={(e) => handleStreetSearch(e.target.value)}
                  className="w-full rounded-full border-none bg-background-light dark:bg-background-dark py-3 pl-12 pr-4 text-text-light dark:text-text-dark soft-shadow-inset focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ backgroundColor: "#f3f4f6" }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">
                  <span className="material-symbols-outlined text-lg">
                    signpost
                  </span>
                </label>
              </div>

              {/* City and Zip Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className="w-full rounded-full border-none bg-background-light dark:bg-background-dark py-3 pl-12 pr-4 text-text-light dark:text-text-dark soft-shadow-inset focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ backgroundColor: "#f3f4f6" }}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">
                    <span className="material-symbols-outlined text-lg">
                      location_city
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Código Postal"
                    value={address.zip}
                    onChange={(e) => handleAddressChange("zip", e.target.value)}
                    className="w-full rounded-full border-none bg-background-light dark:bg-background-dark py-3 pl-12 pr-4 text-text-light dark:text-text-dark soft-shadow-inset focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ backgroundColor: "#f3f4f6" }}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">
                    <span className="material-symbols-outlined text-lg">
                      mail
                    </span>
                  </label>
                </div>
              </div>

              {/* References */}
              <div className="relative">
                <textarea
                  placeholder="Referencias adicionales (ej. color de la casa, entre calles)"
                  value={address.references}
                  onChange={(e) =>
                    handleAddressChange("references", e.target.value)
                  }
                  className="h-24 w-full resize-none rounded-lg border-none bg-background-light dark:bg-background-dark py-3 pl-12 pr-4 text-text-light dark:text-text-dark soft-shadow-inset focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ backgroundColor: "#f3f4f6" }}
                />
                <label className="absolute left-4 top-4 text-text-muted-light dark:text-text-muted-dark">
                  <span className="material-symbols-outlined text-lg">
                    notes
                  </span>
                </label>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 p-4">
          <button
            onClick={handleConfirm}
            className="h-14 w-full rounded-lg text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(101,163,13,0.39)] transition-all hover:shadow-[0_6px_20px_0_rgb(101,163,13,0.23)]"
            style={{ backgroundColor: "#65A30D" }}
          >
            Confirmar Dirección
          </button>
        </footer>
      </div>
    </div>
  );
}
