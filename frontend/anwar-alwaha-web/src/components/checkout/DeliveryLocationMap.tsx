import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, ExternalLink, Check, AlertCircle } from 'lucide-react';

// Fix Leaflet's default marker icon paths in Vite / React bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Brand Pin Icon (High-Contrast Red/Gold Pin)
const brandPinIcon = new L.DivIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="
      position: relative;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #dc2626;
      color: white;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    ">
      <div style="
        transform: rotate(45deg);
        font-size: 16px;
        line-height: 1;
      ">📍</div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

interface DeliveryLocationMapProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

// Controller component to smoothly fly map when coordinates change programmatically
function MapController({
  coords,
  flyTrigger,
}: {
  coords: [number, number];
  flyTrigger: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (flyTrigger > 0) {
      map.flyTo(coords, 16, {
        duration: 1.5,
      });
    }
  }, [flyTrigger, coords, map]);

  return null;
}

// Map Click & Drag Events handler
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const DeliveryLocationMap: React.FC<DeliveryLocationMapProps> = ({
  lat,
  lng,
  onChange,
}) => {
  // Default fallback center: Khamis Mushait / Abha
  const defaultCenter: [number, number] = [18.3093, 42.7336];

  // Active pin coordinates (default to Khamis Mushait if user hasn't chosen yet)
  const currentCoords: [number, number] = useMemo(() => {
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
    return defaultCenter;
  }, [lat, lng]);

  const [isLocating, setIsLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [flyTrigger, setFlyTrigger] = useState(0);
  const markerRef = useRef<L.Marker | null>(null);

  // Handle Dragging Marker
  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const newPos = marker.getLatLng();
      onChange(Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6)));
    }
  };

  // Handle Geolocation (GPS Button)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsMessage('متصفحك لا يدعم تحديد الموقع (GPS)');
      return;
    }

    setIsLocating(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));
        setIsLocating(false);
        onChange(userLat, userLng);
        setFlyTrigger((prev) => prev + 1);
        setGpsMessage('✓ تم تحديد موقعك الحالي بالـ GPS');
        setTimeout(() => setGpsMessage(null), 4000);
      },
      (err) => {
        setIsLocating(false);
        setGpsMessage('تعذر التقاط الموقع، يرجى تفعيل إذن الـ GPS أو النقر على الخريطة');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Top Bar: Instruction & GPS Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
          <MapPin size={14} className="text-red-500" />
          <span>تحديد موقع التوصيل على الخريطة التفاعلية:</span>
        </label>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
          <span>{isLocating ? 'جاري تحديد موقعك...' : 'تحديد موقعي الحالي (GPS)'}</span>
        </button>
      </div>

      {/* GPS Notice Toast / Banner */}
      {gpsMessage && (
        <div className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
          gpsMessage.startsWith('✓')
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {gpsMessage.startsWith('✓') ? <Check size={13} /> : <AlertCircle size={13} />}
          <span>{gpsMessage}</span>
        </div>
      )}

      {/* The Embedded Interactive Map Container */}
      <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border-2 border-zinc-300 shadow-md z-0">
        <MapContainer
          center={currentCoords}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          {/* OpenStreetMap Clean Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Smooth Fly Animation Controller */}
          <MapController coords={currentCoords} flyTrigger={flyTrigger} />

          {/* Click to pick location */}
          <MapClickHandler onLocationSelect={onChange} />

          {/* Draggable Marker */}
          <Marker
            position={currentCoords}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
            ref={markerRef}
            icon={brandPinIcon}
          />
        </MapContainer>

        {/* Floating Instruction Banner over map */}
        <div className="absolute top-2 left-2 right-2 pointer-events-none z-[1000] flex justify-center">
          <div className="bg-black/75 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg border border-white/20">
            📍 انقر على موقعك في الخريطة أو اسحب الدبوس الأحمر لتحديد منزلك بدقة
          </div>
        </div>

        {/* Floating Bottom Coordinates Pill */}
        <div className="absolute bottom-2 left-2 z-[1000]">
          <div className="bg-white/90 backdrop-blur-sm text-zinc-800 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-md border border-zinc-200 flex items-center gap-1.5" dir="ltr">
            <span>{currentCoords[0].toFixed(5)}, {currentCoords[1].toFixed(5)}</span>
            <a
              href={`https://www.google.com/maps?q=${currentCoords[0]},${currentCoords[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 p-0.5"
              title="فتح في Google Maps"
            >
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
