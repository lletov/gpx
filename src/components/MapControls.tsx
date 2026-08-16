import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Minus, Plus, Scan } from 'lucide-react';
import { useStore } from '../store';

const PAD_TL: [number, number] = [24, 24];
const PAD_BR: [number, number] = [24, 96]; // запас снизу под мобильную шторку

export const FIT_BOUNDS_OPTIONS: L.FitBoundsOptions = {
    paddingTopLeft: PAD_TL,
    paddingBottomRight: PAD_BR,
};

// Где окажется центр трека после fitBounds (из-за асимметричных отступов):
// центр вьюпорта + этот офсет. Для наших паддингов это (0, -36) — на 36px выше центра
const FIT_CENTER_OFFSET = L.point(
    (PAD_TL[0] - PAD_BR[0]) / 2,
    (PAD_TL[1] - PAD_BR[1]) / 2
);

// Пиксельный допуск: в этих пределах считаем трек «отцентрированным»
const CENTER_EPS = 2;

const btnCls =
    'flex h-9 w-9 items-center justify-center text-slate-200 transition-colors hover:bg-slate-700/70 active:bg-slate-600/70 disabled:pointer-events-none disabled:opacity-35';

export default function MapControls() {
    const map = useStore((s) => s.mapInstance);
    const track = useStore((s) => s.track);

    const trackBounds = useMemo(
        () =>
            track.length > 1
                ? L.latLngBounds(track.map((p) => [p.lat, p.lon] as L.LatLngTuple))
                : null,
        [track]
    );
    const trackCenter = useMemo(() => trackBounds?.getCenter() ?? null, [trackBounds]);

    const [canZoomIn, setCanZoomIn] = useState(true);
    const [canZoomOut, setCanZoomOut] = useState(true);
    const [isCentered, setIsCentered] = useState(true);

    useEffect(() => {
        if (!map) return;
        const update = () => {
            const zoom = map.getZoom();
            setCanZoomIn(zoom < map.getMaxZoom());
            setCanZoomOut(zoom > map.getMinZoom());

            if (!trackCenter) {
                setIsCentered(true);
                return;
            }
            // Целевая точка: где центр трека должен быть после центрирования
            const targetPx = map.getSize().divideBy(2).add(FIT_CENTER_OFFSET);
            const d = map.latLngToContainerPoint(trackCenter).distanceTo(targetPx);
            setIsCentered(d <= CENTER_EPS);
        };
        update();
        map.on('moveend zoomend', update);
        return () => {
            map.off('moveend zoomend', update);
        };
    }, [map, trackCenter]);

    const centerEnabled = !!trackCenter && !isCentered;

    return (
        <div className="absolute left-3 top-3 z-[1000] flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900/90 shadow-lg backdrop-blur">
            <button
                className={btnCls}
                onClick={() => map?.zoomIn()}
                disabled={!map || !canZoomIn}
                title="Приблизить"
                aria-label="Приблизить"
            >
                <Plus size={16} />
            </button>
            <button
                className={btnCls}
                onClick={() => map?.zoomOut()}
                disabled={!map || !canZoomOut}
                title="Отдалить"
                aria-label="Отдалить"
            >
                <Minus size={16} />
            </button>

            <div className="mx-1 h-px bg-slate-700" aria-hidden />

            <button
                className={btnCls}
                onClick={() => trackBounds && map?.fitBounds(trackBounds, FIT_BOUNDS_OPTIONS)}
                disabled={!centerEnabled}
                title="Центрировать трек"
                aria-label="Центрировать трек"
            >
                <Scan size={16} />
            </button>
        </div>
    );
}