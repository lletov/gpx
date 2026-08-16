import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Minus, Plus, Scan } from 'lucide-react';
import { useStore } from '../store';

export const FIT_BOUNDS_OPTIONS: L.FitBoundsOptions = {
    paddingTopLeft: [24, 24],
    paddingBottomRight: [24, 96], // запас снизу под мобильную шторку
};

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

    const [canZoomIn, setCanZoomIn] = useState(true);
    const [canZoomOut, setCanZoomOut] = useState(true);
    const [trackInView, setTrackInView] = useState(true);

    useEffect(() => {
        if (!map) return;
        const update = () => {
            const zoom = map.getZoom();
            setCanZoomIn(zoom < map.getMaxZoom());
            setCanZoomOut(zoom > map.getMinZoom());
            setTrackInView(trackBounds ? map.getBounds().intersects(trackBounds) : true);
        };
        update();
        map.on('moveend zoomend', update);
        return () => {
            map.off('moveend zoomend', update);
        };
    }, [map, trackBounds]);

    const centerEnabled = !!trackBounds && !trackInView;

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