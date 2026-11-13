"use client";

import { useEffect, useMemo } from "react";
import { divIcon, type LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { marketCenters, type AppMarket } from "@/lib/markets";

const markerIcon = divIcon({
  className: "property-location-picker-marker",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#d3b184;border:3px solid #1f1914;box-shadow:0 0 0 4px rgba(211,177,132,0.22);"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function RecenterMap({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

function MapClickHandler({
  onPick,
}: {
  onPick: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

export function PropertyLocationPicker({
  latitude,
  longitude,
  market,
  onPick,
}: {
  latitude: number | null;
  longitude: number | null;
  market: AppMarket;
  onPick: (coords: { lat: number; lng: number }) => void;
}) {
  const center = useMemo<LatLngExpression>(() => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      return [latitude, longitude];
    }

    const fallback = marketCenters[market] ?? marketCenters.CDMX;
    return [fallback.lat, fallback.lng];
  }, [latitude, longitude, market]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-zinc-200/90 bg-white shadow-[0_18px_60px_rgba(24,24,27,0.08)]">
      <MapContainer center={center} zoom={14} scrollWheelZoom className="h-[320px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        <MapClickHandler onPick={onPick} />
        {typeof latitude === "number" && typeof longitude === "number" ? <Marker position={[latitude, longitude]} icon={markerIcon} /> : null}
      </MapContainer>
      <div className="border-t border-zinc-200/90 bg-white/80 px-4 py-3 text-xs leading-6 text-zinc-600">
        Haz clic en el mapa para fijar la ubicación exacta de la propiedad. Mucho más digno que andar copiando coordenadas a mano como castigo administrativo.
      </div>
    </div>
  );
}
