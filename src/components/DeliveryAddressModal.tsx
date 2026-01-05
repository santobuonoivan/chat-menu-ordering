"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { useMenuStore } from "@/stores/menuStore";
import { ApiCallQuoteByRestId } from "@/handlers/delivery/quotes";
import { useSessionStore } from "@/stores/sessionStore";

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: DeliveryAddress) => void;
}

export interface DeliveryAddress {
  street: string;
  streetNumber: string;
  city: string;
  state: string;
  zip: string;
  references: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
  county?: string;
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
  const { getMenuData } = useMenuStore();
  const { setQuoteData } = useDeliveryStore();
  const [findQuoteLoading, setFindQuoteLoading] = useState(false);
  const { clientPhone } = useSessionStore();
  const [address, setAddress] = useState<DeliveryAddress>({
    street: "",
    streetNumber: "",
    city: "",
    state: "",
    zip: "",
    references: "",
    phoneNumber: "",
    latitude: 0,
    longitude: 0,
    neighborhood: "",
    county: "",
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const geocoderInstance = useRef<any>(null);
  const mapInitialized = useRef(false);
  const hasInitialized = useRef(false);
  const [hasQuote, setHasQuote] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromMap = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showValidation, setShowValidation] = useState(false);

  // Cargar dirección guardada si existe (solo una vez al abrir)
  useEffect(() => {
    if (isOpen && storedAddress && !hasInitialized.current) {
      hasInitialized.current = true;
      // Asegurar que todos los campos tengan valores definidos
      setAddress({
        street: storedAddress.street || "",
        streetNumber: storedAddress.streetNumber || "",
        city: storedAddress.city || "",
        state: storedAddress.state || "",
        zip: storedAddress.zip || "",
        references: storedAddress.references || "",
        phoneNumber: storedAddress.phoneNumber || clientPhone || "",
        latitude: storedAddress.latitude || 0,
        longitude: storedAddress.longitude || 0,
        neighborhood: storedAddress.neighborhood || "",
        county: storedAddress.county || "",
      });
    } else if (isOpen && !storedAddress && !hasInitialized.current) {
      // Si no hay dirección guardada pero hay clientPhone, usarlo
      hasInitialized.current = true;
      setAddress((prev) => ({
        ...prev,
        phoneNumber: clientPhone || "",
      }));
    }

    // Reset cuando se cierra el modal
    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen, storedAddress, clientPhone]);

  // Guardar dirección en el store cada vez que cambia (pero no en la carga inicial)
  useEffect(() => {
    if (
      hasInitialized.current &&
      (address.latitude !== 0 || address.longitude !== 0)
    ) {
      setStoredAddress(address);
    }
  }, [
    address.street,
    address.streetNumber,
    address.city,
    address.state,
    address.zip,
    address.references,
    address.phoneNumber,
    address.latitude,
    address.longitude,
    address.neighborhood,
    address.county,
    setStoredAddress,
  ]);

  // Cargar Google Maps API
  useEffect(() => {
    if (!isOpen) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
          ("AIzaSyCcdxhPVJVVDZq-rMXtpfa0TmCbxXZPidw" as String);
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
      isUpdatingFromMap.current = true; // Marcar que viene del mapa
      const response = await geocoderInstance.current.geocode({
        location: { lat, lng },
      });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const addressComponents = result.address_components;

        let street = "";
        let city = "";
        let state = "";
        let zip = "";
        let neighborhood = "";
        let county = "";

        // Extraer componentes de dirección

        /*
          [
            { long_name: '425', short_name: '425', types: [ 'street_number' ] },
            { long_name: '9 de Julio', short_name: '9 de Julio', types: [ 'route' ] },
            {
              long_name: 'Quilmes',
              short_name: 'Quilmes',
              types: [ 'locality', 'political' ]
            },
            {
              long_name: 'Quilmes',
              short_name: 'Quilmes',
              types: [ 'administrative_area_level_2', 'political' ]
            },
            {
              long_name: 'Provincia de Buenos Aires',
              short_name: 'Provincia de Buenos Aires',
              types: [ 'administrative_area_level_1', 'political' ]
            },
            {
              long_name: 'Argentina',
              short_name: 'AR',
              types: [ 'country', 'political' ]
            },
            { long_name: 'B1879', short_name: 'B1879', types: [ 'postal_code' ] }
          ]
        */

        let streetNumber = "";

        addressComponents.forEach((component: any) => {
          const types = component.types;

          if (types.includes("route")) {
            street = component.long_name;
          }
          if (types.includes("street_number")) {
            streetNumber = component.long_name;
          }
          if (
            types.includes("locality") ||
            types.includes("administrative_area_level_2")
          ) {
            city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
          if (types.includes("postal_code")) {
            zip = component.long_name;
          }
          if (types.includes("neighborhood")) {
            neighborhood = component.long_name;
          }
          if (types.includes("country")) {
            county = component.long_name;
          }
        });

        setAddress((prev) => ({
          ...prev,
          street: street || result.formatted_address,
          streetNumber: streetNumber || prev.streetNumber,
          city: city || "",
          state: state || "",
          zip: zip || "",
          neighborhood: neighborhood || "",
          county: county || "",
        }));

        setTimeout(() => {
          isUpdatingFromMap.current = false; // Resetear después de actualizar
        }, 100);
      }
    } catch (error) {
      console.error("Error en geocoding inverso:", error);
      isUpdatingFromMap.current = false;
    }
  };

  // Geocoding: buscar dirección y mover marcador
  const searchAddress = async (data: {
    street: string;
    number: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  }) => {
    if (!geocoderInstance.current) return;

    // Construimos el string base (Calle + Altura)
    const mainAddress = `${data.street} ${data.number}`;

    const request = {
      address: mainAddress,
      // Aquí es donde sucede la magia: restringimos por componentes exactos
      componentRestrictions: {
        route: data.street,
        locality: data.city,
        administrativeArea: data.province,
        postalCode: data.postalCode,
        country: "MX",
      },
    };

    try {
      const response = await geocoderInstance.current.geocode(request);

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const location = result.geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const addressComponents = result.address_components;

        // Mover marcador y mapa
        markerInstance.current.setPosition({ lat, lng });
        mapInstance.current.setCenter({ lat, lng });

        // Procesar componentes de dirección directamente
        let street = "";
        let streetNumber = "";
        let city = "";
        let state = "";
        let zip = "";
        let neighborhood = "";
        let county = "";

        addressComponents.forEach((component: any) => {
          const types = component.types;

          if (types.includes("route")) {
            street = component.long_name;
          }
          if (types.includes("street_number")) {
            streetNumber = component.long_name;
          }
          if (
            types.includes("locality") ||
            types.includes("administrative_area_level_2")
          ) {
            city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
          if (types.includes("postal_code")) {
            zip = component.long_name;
          }
          if (types.includes("neighborhood")) {
            neighborhood = component.long_name;
          }
          if (types.includes("country")) {
            county = component.long_name;
          }
        });

        // Actualizar TODOS los campos con lo que Google Maps encontró
        setAddress((prev) => ({
          ...prev,
          street: street || result.formatted_address,
          streetNumber: streetNumber || prev.streetNumber,
          city: city || "",
          state: state || "",
          zip: zip || "",
          neighborhood: neighborhood || "",
          county: county || "",
          latitude: lat,
          longitude: lng,
        }));
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

  const handleStreetSearch = (value: string) => {
    // Solo actualizar el campo, NO buscar automáticamente
    handleAddressChange("street", value);

    // Cancelar búsqueda anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // NO hacer búsqueda automática para evitar el loop
    // El usuario puede presionar Enter o un botón para buscar
  };

  const handleSearchManually = async () => {
    // Búsqueda manual cuando el usuario lo solicite
    if (address.street.length > 3) {
      await searchAddress({
        street: address.street,
        number: address.streetNumber,
        city: address.city,
        province: address.state,
        postalCode: address.zip, // Asegúrate de tener este campo en tu estado
        country: address.county, // Opcional: Restringir a Argentina mejora mucho la velocidad
      });
    }
  };

  const handleConfirm = () => {
    if (
      !address.street ||
      !address.streetNumber ||
      !address.city ||
      !address.state ||
      !address.zip ||
      !address.phoneNumber
    ) {
      setShowValidation(true);
      setErrorMessage("Por favor completa todos los campos requeridos");
      return;
    }
    setShowValidation(false);
    setErrorMessage("");
    setFindQuoteLoading(true);
    getDeliveryQuote()
      .then((result) => {
        console.log("Delivery quote result:", result);
        if (result) {
          onConfirm(address);
          setFindQuoteLoading(false);
        } else {
          setErrorMessage(
            "No se pudo obtener una cotización de entrega. Por favor verifica tu dirección."
          );
          setFindQuoteLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error obteniendo cotización de entrega:", error);
        setErrorMessage(
          "Error al obtener la cotización. Por favor intenta de nuevo."
        );
        setFindQuoteLoading(false);
      });
  };

  const getDeliveryQuote = async () => {
    const menuData = getMenuData();
    if (menuData && menuData.rest_id) {
      const payload = {
        rest_id: parseInt(menuData.rest_id.toString()),
        lat: address.latitude,
        lng: address.longitude,
      };
      return await ApiCallQuoteByRestId(payload)
        .then(async (res) => {
          return { success: [200, 201].includes(res.status), data: res.data };
        })
        .then((response) => {
          if (response.success) {
            const quoteUUID = response.data?.data?.quote?.data?.quoteUUID;
            const summary = response.data?.data?.quote?.data?.summary;
            const { overloadAmountFee } = summary;
            setQuoteData({
              quoteUUID,
              overloadAmountFee,
            });
            setHasQuote(true);
            return true;
          } else {
            console.error("Error obteniendo costo de entrega", response);
          }
        })
        .catch((error) => {
          console.error("Error en GetDeliveryCost:", error);
          return false;
        });
    } else {
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="relative flex h-full max-h-[900px] w-full max-w-[450px] flex-col overflow-hidden rounded-xl  bg-[#f3f4f6] dark:bg-[#111b21]">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-2 p-4 dark:bg-[#202c33] border-b border-transparent dark:border-[#2a3942]">
          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full text-white dark:text-white  transition-all active:-inset bg-[#8E2653] dark:bg-[#00a884]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-black tracking-tight text-text-light dark:text-[#e9edef]">
            Dirección de Entrega
          </h1>
          <div className="w-12"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="flex flex-col gap-6">
            {/* Map Container */}
            <div className="relative h-48 w-full overflow-hidden rounded-lg ">
              <div
                ref={mapRef}
                className="h-full w-full"
                style={{ backgroundColor: "#e5e7eb" }}
              />
              <div className="absolute top-2 right-2 bg-white dark:bg-[#202c33] rounded-lg shadow p-2 text-xs z-10">
                <p className="font-semibold text-gray-900 dark:text-[#e9edef]">
                  {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Address Form */}
            <div className="flex flex-col gap-4">
              {/* Phone Number */}
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Teléfono *"
                  value={address.phoneNumber}
                  onChange={(e) =>
                    handleAddressChange("phoneNumber", e.target.value)
                  }
                  className={`w-full rounded-full bg-[#f3f4f6] dark:bg-[#2a3942] py-3 pl-12 pr-4 text-text-light dark:text-[#e9edef] -inset focus:outline-none focus:ring-2 focus:ring-primary/50 dark:placeholder:text-[#8696a0] ${
                    showValidation && !address.phoneNumber
                      ? "border-2 border-red-500"
                      : "border-none"
                  }`}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-[#8696a0]">
                  <span className="material-symbols-outlined text-lg">
                    phone
                  </span>
                </label>
              </div>

              {/* Street Input with Search Button */}
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Escribe la dirección y presiona buscar *"
                    value={address.street}
                    onChange={(e) => handleStreetSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchManually();
                      }
                    }}
                    className={`w-full rounded-full bg-[#f3f4f6] dark:bg-[#2a3942] py-3 pl-12 pr-4 text-text-light dark:text-[#e9edef] -inset focus:outline-none focus:ring-2 focus:ring-primary/50 dark:placeholder:text-[#8696a0] ${
                      showValidation && !address.street
                        ? "border-2 border-red-500"
                        : "border-none"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-[#8696a0]">
                    <span className="material-symbols-outlined text-lg">
                      signpost
                    </span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleSearchManually}
                  className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 bg-[#8E2653] dark:bg-[#00a884]"
                  title="Buscar dirección"
                >
                  <span className="material-symbols-outlined text-white text-xl">
                    search
                  </span>
                </button>
              </div>

              {/* Street Number and Apartment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Número *"
                    value={address.streetNumber}
                    onChange={(e) =>
                      handleAddressChange("streetNumber", e.target.value)
                    }
                    className={`w-full rounded-full bg-[#f3f4f6] dark:bg-[#2a3942] py-3 pl-12 pr-4 text-text-light dark:text-[#e9edef] -inset focus:outline-none focus:ring-2 focus:ring-primary/50 dark:placeholder:text-[#8696a0] ${
                      showValidation && !address.streetNumber
                        ? "border-2 border-red-500"
                        : "border-none"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-[#8696a0]">
                    <span className="material-symbols-outlined text-lg">
                      numbers
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Apto/Depto (opcional)"
                    value={address.references}
                    onChange={(e) =>
                      handleAddressChange("references", e.target.value)
                    }
                    className="w-full rounded-full border-none bg-[#f3f4f6] dark:bg-[#2a3942] py-3 pl-12 pr-4 text-text-light dark:text-[#e9edef] -inset focus:outline-none focus:ring-2 focus:ring-primary/50 dark:placeholder:text-[#8696a0]"
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-[#8696a0]">
                    <span className="material-symbols-outlined text-lg">
                      apartment
                    </span>
                  </label>
                </div>
              </div>

              {/* State and City Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Estado *"
                    value={address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    className={`w-full rounded-full bg-[#f3f4f6] dark:bg-[#2a3942] py-3 pl-12 pr-4 text-text-light dark:text-[#e9edef] -inset focus:outline-none focus:ring-2 focus:ring-primary/50 dark:placeholder:text-[#8696a0] ${
                      showValidation && !address.state
                        ? "border-2 border-red-500"
                        : "border-none"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-[#8696a0]">
                    <span className="material-symbols-outlined text-lg">
                      location_city
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ciudad *"
                    value={address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className={`w-full rounded-full bg-[#f3f4f6] dark:bg-[#2a3942] py-3 pl-12 pr-4 text-text-light dark:text-[#e9edef] -inset focus:outline-none focus:ring-2 focus:ring-primary/50 dark:placeholder:text-[#8696a0] ${
                      showValidation && !address.city
                        ? "border-2 border-red-500"
                        : "border-none"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-[#8696a0]">
                    <span className="material-symbols-outlined text-lg">
                      location_city
                    </span>
                  </label>
                </div>
              </div>

              {/* Zip Code */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Código Postal *"
                  value={address.zip}
                  onChange={(e) => handleAddressChange("zip", e.target.value)}
                  className={`w-full rounded-full bg-[#f3f4f6] dark:bg-[#2a3942] py-3 pl-12 pr-4 text-text-light dark:text-[#e9edef] -inset focus:outline-none focus:ring-2 focus:ring-primary/50 dark:placeholder:text-[#8696a0] ${
                    showValidation && !address.zip
                      ? "border-2 border-red-500"
                      : "border-none"
                  }`}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-[#8696a0]">
                  <span className="material-symbols-outlined text-lg">
                    mail
                  </span>
                </label>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 p-4 border-t border-transparent dark:border-[#2a3942]">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 rounded-lg p-3 flex items-start gap-2  bg-[#fee2e2] dark:bg-[#5c1a1a]">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">
                error
              </span>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium flex-1">
                {errorMessage}
              </p>
            </div>
          )}

          <button
            disabled={findQuoteLoading}
            onClick={handleConfirm}
            className="h-14 w-full rounded-lg text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(101,163,13,0.39)] transition-all hover:shadow-[0_6px_20px_0_rgb(101,163,13,0.23)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#8E2653] dark:bg-[#00a884]"
          >
            {findQuoteLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">
                  refresh
                </span>
                <span>Buscando cotización...</span>
              </>
            ) : (
              "Confirmar Dirección"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
