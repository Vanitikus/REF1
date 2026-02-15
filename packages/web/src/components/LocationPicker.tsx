'use client';

import { useState, useEffect, useRef } from 'react';

interface LocationPickerProps {
  value: string;
  coords: { lat: number; lng: number } | null;
  onChange: (location: string, coords: { lat: number; lng: number } | null) => void;
}

export function LocationPicker({ value, coords, onChange }: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState(coords || { lat: 44.4268, lng: 26.1025 });
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCoords(newCoords);
        onChange(`${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)}`, newCoords);
        reverseGeocode(newCoords);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  };

  const reverseGeocode = async (c: { lat: number; lng: number }) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lng}&zoom=18`);
      const data = await res.json();
      if (data.display_name) {
        const parts = data.display_name.split(', ');
        const short = parts.slice(0, 3).join(', ');
        onChange(short, c);
      }
    } catch {
      onChange(`${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`, c);
    }
  };

  useEffect(() => {
    if (!showMap || !mapRef.current) return;

    let L: typeof import('leaflet');
    let map: import('leaflet').Map;
    let marker: import('leaflet').Marker;

    const initMap = async () => {
      L = (await import('leaflet')).default;

      // Inject CSS
      if (!document.getElementById('leaflet-css-picker')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-picker';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      map = L.map(mapRef.current!, { zoomControl: false }).setView([mapCoords.lat, mapCoords.lng], 15);
      mapInstanceRef.current = map;

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const icon = L.divIcon({
        html: '<div style="width:32px;height:32px;background:#2EC4B6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px">\u{1F4CD}</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: '',
      });

      marker = L.marker([mapCoords.lat, mapCoords.lng], { icon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const c = { lat: pos.lat, lng: pos.lng };
        setMapCoords(c);
        reverseGeocode(c);
      });

      map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        const c = { lat: e.latlng.lat, lng: e.latlng.lng };
        marker.setLatLng(e.latlng);
        setMapCoords(c);
        reverseGeocode(c);
      });
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{'\u{1F4CD}'}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value, coords)}
          placeholder="ex: Parcul Herastrau, Sector 1, Bucuresti"
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-teal-700 bg-brand-teal-50 border border-brand-teal-200 rounded-lg hover:bg-brand-teal-100 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-3 h-3 border-2 border-brand-orange-300 border-t-brand-orange-500 rounded-full animate-spin" />
          ) : (
            <span>{'\u{1F4F1}'}</span>
          )}
          Locatia mea
        </button>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <span>{'\u{1F5FA}'}</span>
          {showMap ? 'Ascunde harta' : 'Alege pe harta'}
        </button>
      </div>

      {/* Map */}
      {showMap && (
        <div className="rounded-xl overflow-hidden border border-gray-200 relative">
          <div ref={mapRef} className="h-64 w-full" />
          <div className="absolute top-2 left-2 z-[1000] bg-white/90 rounded-lg px-2 py-1 text-[10px] text-gray-500">
            Apasa pe harta sau muta pinul
          </div>
          {coords && (
            <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 rounded-lg px-2 py-1 text-[10px] text-gray-600">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
