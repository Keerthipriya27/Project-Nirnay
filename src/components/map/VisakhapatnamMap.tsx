import { Circle, MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const VISAKHAPATNAM_CENTER: [number, number] = [17.6868, 83.2185];

const FLOOD_ZONE_CENTER: [number, number] = [17.705, 83.255];

export function VisakhapatnamMap() {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={VISAKHAPATNAM_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Nirnay affected / flood zone */}
        <Circle
          center={FLOOD_ZONE_CENTER}
          radius={1800}
          pathOptions={{
            color: '#ff3b30',
            fillColor: '#ff3b30',
            fillOpacity: 0.2,
            weight: 2,
          }}
        />
      </MapContainer>

      {/* Nirnay map label */}
      <div className="absolute top-4 left-4 z-[1000] bg-[#0a0a0c]/95 border border-white/10 rounded-lg px-4 py-3 shadow-xl">
        <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
          Visakhapatnam
        </div>

        <div className="text-[10px] font-mono text-[#00ff99] mt-1">
          REAL-TIME GEOGRAPHIC MAP
        </div>
      </div>

      {/* Crisis legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#0a0a0c]/95 border border-white/10 rounded-lg px-4 py-3 shadow-xl">
        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
          Crisis Layers
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-white">
          <span className="w-3 h-3 rounded-full bg-[#ff3b30] opacity-70" />
          Flood / Affected Zone
        </div>
      </div>
    </div>
  );
}

export default VisakhapatnamMap;