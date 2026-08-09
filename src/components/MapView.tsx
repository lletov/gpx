import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import L from 'leaflet';
import { useStore, FILTER_CSS } from '../store';
import { TILE_PROVIDERS } from '../lib/tiles';
import { decimate, lerpColor } from '../lib/utils';
import ExportButton from './ExportButton';

export default function MapView() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const tileRef = useRef<L.TileLayer | null>(null);
    const overlayRef = useRef<L.LayerGroup | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const s = useStore();

    // Инициализация карты
    useEffect(() => {
        if (!containerRef.current) return;
        const map = L.map(containerRef.current, { attributionControl: false }).setView([46.5, 7.9], 4);
        mapRef.current = map;
        overlayRef.current = L.layerGroup().addTo(map);
        useStore.getState().patch({ mapInstance: map });

        const onResize = () => map.invalidateSize();
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            useStore.getState().patch({ mapInstance: null });
            map.remove();
            mapRef.current = null;
            overlayRef.current = null;
            tileRef.current = null;
        };
    }, []);

    // Подложка
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        const provider = TILE_PROVIDERS.find((p) => p.id === s.providerId) ?? TILE_PROVIDERS[0];
        tileRef.current?.remove();
        tileRef.current = null;
        if (s.mapVisible) {
            tileRef.current = L.tileLayer(provider.url, {
                attribution: provider.attribution,
                maxZoom: 20,
                maxNativeZoom: provider.maxNativeZoom,
                crossOrigin: 'anonymous',
            }).addTo(map);
        }
    }, [s.providerId, s.mapVisible]);

    // Прозрачность и фильтры подложки
    useEffect(() => {
        const pane = mapRef.current?.getPane('tilePane');
        if (!pane) return;
        pane.style.opacity = String(s.mapOpacity);
        pane.style.filter = FILTER_CSS[s.mapFilter];
    }, [s.mapOpacity, s.mapFilter]);

    // «Шахматный» фон для режима без подложки.
    // Управляем инлайновым стилем, НЕ трогая className — им владеет Leaflet
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        if (s.mapVisible) {
            el.style.backgroundImage = '';
            el.style.backgroundSize = '';
        } else {
            el.style.backgroundImage = 'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)';
            el.style.backgroundSize = '24px 24px';
        }
    }, [s.mapVisible]);

    // Трек и точки
    useEffect(() => {
        const group = overlayRef.current;
        if (!group) return;
        group.clearLayers();

        if (s.track.length > 1) {
            const latlngs = s.track.map((p) => [p.lat, p.lon] as L.LatLngTuple);

            if (s.casingEnabled) {
                L.polyline(latlngs, {
                    color: s.casingColor,
                    weight: s.lineWidth + s.casingWidth * 2,
                    opacity: 1,
                }).addTo(group);
            }

            if (s.gradientEnabled) {
                const pts = decimate(s.track, 700);
                for (let i = 1; i < pts.length; i++) {
                    L.polyline(
                        [
                            [pts[i - 1].lat, pts[i - 1].lon],
                            [pts[i].lat, pts[i].lon],
                        ],
                        {
                            color: lerpColor(s.gradientFrom, s.gradientTo, (i - 1) / Math.max(1, pts.length - 2)),
                            weight: s.lineWidth,
                            opacity: 1,
                        }
                    ).addTo(group);
                }
            } else {
                L.polyline(latlngs, { color: s.lineColor, weight: s.lineWidth, opacity: 1 }).addTo(group);
            }
        }

        if (s.pointsVisible) {
            for (const w of s.waypoints) {
                const m = L.circleMarker([w.lat, w.lon], {
                    radius: s.pointRadius,
                    fillColor: s.pointColor,
                    color: '#ffffff',
                    weight: 2,
                    fillOpacity: 1,
                });
                if (w.name) m.bindTooltip(w.name, { permanent: true, direction: 'right', offset: [6, 0] });
                m.addTo(group);
            }
        }
    }, [
        s.track, s.waypoints, s.lineColor, s.lineWidth, s.casingEnabled, s.casingColor,
        s.casingWidth, s.gradientEnabled, s.gradientFrom, s.gradientTo,
        s.pointsVisible, s.pointRadius, s.pointColor,
    ]);

    // Вписать трек (снизу запас под шторку)
    useEffect(() => {
        const map = mapRef.current;
        if (map && s.track.length > 1) {
            map.fitBounds(L.latLngBounds(s.track.map((p) => [p.lat, p.lon] as L.LatLngTuple)), {
                paddingTopLeft: [24, 24],
                paddingBottomRight: [24, 96],
            });
        }
    }, [s.track]);

    const onDrop = async (e: DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) await s.loadFile(f);
    };

    return (
        <div
            className="relative h-full w-full"
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
        >
            {/* ВАЖНО: className статичный. Leaflet сам управляет классами этого элемента
          (leaflet-container и др.). Динамический className от React затирает их
          при ре-рендере и ломает карту */}
            <div ref={containerRef} className="h-full w-full" />

            {dragOver && (
                <div className="pointer-events-none absolute inset-0 z-[1100] flex items-center justify-center bg-slate-900/70 text-lg font-medium text-white">
                    Отпустите GPX-файл
                </div>
            )}

            {/* Экспорт — только на десктопе; на мобилке кнопка в шторке */}
            <div className="absolute right-3 top-3 z-[1000] hidden lg:block">
                <ExportButton />
            </div>
        </div>
    );
}