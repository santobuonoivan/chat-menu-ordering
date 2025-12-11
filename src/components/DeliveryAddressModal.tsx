"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { GetDeliveryCost } from "@/services";
import { useMenuStore } from "@/stores/menuStore";
import { get } from "http";

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
        phoneNumber: storedAddress.phoneNumber || "",
        latitude: storedAddress.latitude || 0,
        longitude: storedAddress.longitude || 0,
        neighborhood: storedAddress.neighborhood || "",
        county: storedAddress.county || "",
      });
    }

    // Reset cuando se cierra el modal
    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen, storedAddress]);

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
        let state = "";
        let zip = "";
        let neighborhood = "";
        let county = "";

        // Extraer componentes de dirección

        console.log("Address Components:", addressComponents);
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
          city: city || "",
          state: state || "",
          zip: zip || "",
          neighborhood: neighborhood || "",
          county: county || "",
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
    if (
      !address.street ||
      !address.streetNumber ||
      !address.city ||
      !address.state ||
      !address.zip ||
      !address.phoneNumber
    ) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    setFindQuoteLoading(true);
    getDeliveryQuote()
      .then((result) => {
        console.log("Delivery quote result:", result);
        setTimeout(() => {
          if (hasQuote) {
            onConfirm(address);
            setFindQuoteLoading(false);
          } else {
            console.log(
              "No se pudo obtener una cotización de entrega. Por favor verifica tu dirección."
            );
            setFindQuoteLoading(false);
          }
        }, 500);
      })
      .catch((error) => {
        console.error("Error obteniendo cotización de entrega:", error);
        setFindQuoteLoading(false);
      });
  };

  const getDeliveryQuote = async () => {
    return new Promise((resolve, reject) => {
      const menuData = getMenuData();
      if (menuData && menuData.rest_id) {
        GetDeliveryCost({
          lat: address.latitude,
          lng: address.longitude,
          rest_id: parseInt(menuData.rest_id.toString()),
        })
          .then((response) => {
            if (response.success) {
              const quoteUUID = response.data?.data?.quote?.data?.quoteUUID;
              const summary = response.data?.data?.quote?.data?.summary;
              console.log("Quote UUID:", quoteUUID);
              console.log("Summary:", summary);
              const { overloadAmountFee } = summary;
              setQuoteData({
                quoteUUID,
                overloadAmountFee,
              });
              setHasQuote(true);
              resolve(true);
            } else {
              console.error("Error obteniendo costo de entrega", response);
              reject(new Error("No se pudo obtener cotización"));
            }
          })
          .catch((error) => {
            console.error("Error en GetDeliveryCost:", error);
            reject(error);
          });
      } else {
        reject(new Error("No hay datos de restaurante"));
      }
    });
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
              {/* Phone Number */}
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={address.phoneNumber}
                  onChange={(e) =>
                    handleAddressChange("phoneNumber", e.target.value)
                  }
                  className="w-full rounded-full border-none bg-background-light dark:bg-background-dark py-3 pl-12 pr-4 text-text-light dark:text-text-dark soft-shadow-inset focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ backgroundColor: "#f3f4f6" }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">
                  <span className="material-symbols-outlined text-lg">
                    phone
                  </span>
                </label>
              </div>

              {/* Street Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Calle"
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

              {/* Street Number and Apartment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Número"
                    value={address.streetNumber}
                    onChange={(e) =>
                      handleAddressChange("streetNumber", e.target.value)
                    }
                    className="w-full rounded-full border-none bg-background-light dark:bg-background-dark py-3 pl-12 pr-4 text-text-light dark:text-text-dark soft-shadow-inset focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ backgroundColor: "#f3f4f6" }}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">
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
                    className="w-full rounded-full border-none bg-background-light dark:bg-background-dark py-3 pl-12 pr-4 text-text-light dark:text-text-dark soft-shadow-inset focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ backgroundColor: "#f3f4f6" }}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">
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
                    placeholder="Estado"
                    value={address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
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
              </div>

              {/* Zip Code */}
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
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 p-4">
          <button
            disabled={findQuoteLoading}
            onClick={handleConfirm}
            className="h-14 w-full rounded-lg text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(101,163,13,0.39)] transition-all hover:shadow-[0_6px_20px_0_rgb(101,163,13,0.23)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#65A30D" }}
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
