'use client';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';

const STATIONS = [
  {
    name: 'Maitri Station',
    lat: -70.7669,
    lng: 11.7347,
    type: 'active',
    info: 'Dronning Maud Land · 70°46\'S · 11°44\'E',
  },
  {
    name: 'Bharati Station',
    lat: -69.4071,
    lng: 76.1924,
    type: 'active',
    info: 'Larsemann Hills · 69°24\'S · 76°11\'E',
  },
];

export function StationMap() {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return;

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // Dark tile layer
      const map = L.map(containerRef.current, {
        center: [-70, 45],
        zoom: 3,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker
      const markerIcon = (label: string) => L.divIcon({
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        html: `<div style="
          width:20px;height:20px;border-radius:50%;
          background:rgba(0,212,255,0.2);
          border:2px solid #00D4FF;
          box-shadow:0 0 12px rgba(0,212,255,0.6);
          display:flex;align-items:center;justify-content:center;
          position:relative;
        ">
          <div style="
            position:absolute;
            width:40px;height:40px;border-radius:50%;
            border:1px solid rgba(0,212,255,0.3);
            top:-11px;left:-11px;
            animation:ping 2s ease-out infinite;
          "></div>
        </div>`,
      });

      STATIONS.forEach((s) => {
        const popup = L.popup({ className: 'polar-popup' }).setContent(`
          <div style="background:#152035;border:1px solid #1E3050;border-radius:8px;padding:12px;min-width:180px;font-family:Inter,sans-serif;">
            <div style="color:#00D4FF;font-weight:600;font-size:13px;margin-bottom:4px;">🏔️ ${s.name}</div>
            <div style="color:#94A3B8;font-size:11px;">${s.info}</div>
            <div style="margin-top:6px;display:flex;align-items:center;gap:4px;">
              <span style="width:6px;height:6px;background:#10B981;border-radius:50%;display:inline-block;"></span>
              <span style="color:#10B981;font-size:11px;">Active</span>
            </div>
          </div>
        `);
        L.marker([s.lat, s.lng], { icon: markerIcon(s.name) })
          .addTo(map)
          .bindPopup(popup);
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="polar-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-polar-border">
        <span className="text-base">🗺️</span>
        <h3 className="font-heading font-semibold text-sm text-polar-text">Antarctica Operations Map</h3>
      </div>
      <div ref={containerRef} className="h-72 w-full" style={{ background: '#080E1A' }} />
    </div>
  );
}
