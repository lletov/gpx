import type { Map as LMap } from 'leaflet';
import type { AppState } from '../store';
import { FILTER_CSS, useStore } from '../store';
import { TILE_PROVIDERS } from './tiles';
import { decimate, lerpColor } from './utils';

const TILE_SIZE = 256;

/* ---------- Web Mercator ---------- */
const lonToTileX = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const latToTileY = (lat: number, z: number) => {
    const r = (lat * Math.PI) / 180;
    return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};
const tileXToLon = (x: number, z: number) => (x / 2 ** z) * 360 - 180;
const tileYToLat = (y: number, z: number) => {
    const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
    return (180 / Math.PI) * Math.atan(Math.sinh(n));
};

function buildTileUrl(template: string, x: number, y: number, z: number) {
    return template
        .replace('{s}', 'abc'[(x + y) % 3])
        .replace('{z}', String(z))
        .replace('{x}', String(x))
        .replace('{y}', String(y))
        .replace('{r}', '');
}

function loadTile(url: string) {
    return new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

async function drawTiles(ctx: CanvasRenderingContext2D, map: LMap, tileUrl: string) {
    const z = Math.round(map.getZoom());
    const max = 2 ** z - 1;
    const b = map.getBounds().pad(0.05);

    const x0 = Math.max(0, lonToTileX(b.getWest(), z));
    const x1 = Math.min(max, lonToTileX(b.getEast(), z));
    const y0 = Math.max(0, latToTileY(b.getNorth(), z));
    const y1 = Math.min(max, latToTileY(b.getSouth(), z));

    const jobs: Promise<void>[] = [];
    for (let x = x0; x <= x1; x++) {
        for (let y = y0; y <= y1; y++) {
            jobs.push(
                loadTile(buildTileUrl(tileUrl, x, y, z)).then((img) => {
                    if (!img) return;
                    const p = map.latLngToContainerPoint([tileYToLat(y, z), tileXToLon(x, z)]);
                    ctx.drawImage(img, Math.round(p.x), Math.round(p.y), TILE_SIZE, TILE_SIZE);
                })
            );
        }
    }
    await Promise.all(jobs);
}

export async function exportImage(map: LMap, s: AppState, tileUrl: string, attribution: string) {
    const size = map.getSize();
    const scale = s.exportScale;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(size.x * scale);
    canvas.height = Math.round(size.y * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d недоступен');

    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Подложка (если выключена — прозрачный PNG)
    if (s.mapVisible) {
        ctx.save();
        ctx.globalAlpha = s.mapOpacity;
        const filter = FILTER_CSS[s.mapFilter];
        if (filter && 'filter' in ctx) ctx.filter = filter;
        await drawTiles(ctx, map, tileUrl);
        ctx.restore();
    }

    // 2. Трек
    if (s.track.length > 1) {
        const src = s.gradientEnabled ? decimate(s.track, 1500) : s.track;
        const pts = src.map((p) => map.latLngToContainerPoint([p.lat, p.lon]));

        const tracePath = () => {
            ctx.beginPath();
            pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        };

        if (s.casingEnabled) {
            tracePath();
            ctx.strokeStyle = s.casingColor;
            ctx.lineWidth = s.lineWidth + s.casingWidth * 2;
            ctx.stroke();
        }

        if (s.gradientEnabled) {
            for (let i = 1; i < pts.length; i++) {
                ctx.beginPath();
                ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
                ctx.lineTo(pts[i].x, pts[i].y);
                ctx.strokeStyle = lerpColor(s.gradientFrom, s.gradientTo, (i - 1) / Math.max(1, pts.length - 2));
                ctx.lineWidth = s.lineWidth;
                ctx.stroke();
            }
        } else {
            tracePath();
            ctx.strokeStyle = s.lineColor;
            ctx.lineWidth = s.lineWidth;
            ctx.stroke();
        }
    }

    // 3. Точки
    if (s.pointsVisible) {
        for (const w of s.waypoints) {
            const p = map.latLngToContainerPoint([w.lat, w.lon]);
            ctx.beginPath();
            ctx.arc(p.x, p.y, s.pointRadius, 0, Math.PI * 2);
            ctx.fillStyle = s.pointColor;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            if (w.name) {
                ctx.font = '600 12px system-ui, sans-serif';
                const tx = p.x + s.pointRadius + 4;
                const ty = p.y + 4;
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'rgba(255,255,255,0.9)';
                ctx.strokeText(w.name, tx, ty);
                ctx.fillStyle = '#111827';
                ctx.fillText(w.name, tx, ty);
            }
        }
    }

    // 4. Атрибуция
    if (s.mapVisible && attribution) {
        ctx.font = '10px system-ui, sans-serif';
        const w = ctx.measureText(attribution).width;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(size.x - w - 10, size.y - 18, w + 10, 18);
        ctx.fillStyle = '#374151';
        ctx.fillText(attribution, size.x - w - 5, size.y - 5);
    }

    // 5. Скачивание
    const base = (s.fileName ?? 'track').replace(/\.[^.]+$/, '');
    const blob = await new Promise<Blob | null>((resolve, reject) => {
        try {
            canvas.toBlob(resolve, 'image/png');
        } catch (e) {
            reject(e);
        }
    });
    if (!blob) throw new Error('не удалось получить изображение');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${base}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

/** Общая точка входа для кнопок экспорта (десктоп и мобилка) */
export async function exportCurrent() {
    const st = useStore.getState();
    const map = st.mapInstance;
    if (!map || st.track.length < 2 || st.exporting) return;

    const provider = TILE_PROVIDERS.find((p) => p.id === st.providerId) ?? TILE_PROVIDERS[0];
    st.patch({ exporting: true });
    try {
        await exportImage(map, st, provider.url, provider.attribution);
    } catch (e) {
        alert(
            'Не удалось экспортировать: ' +
            (e as Error).message +
            '\n\nЧастая причина — тайлы подложки не отдают CORS-заголовок. Попробуйте другого провайдера или отключите подложку.'
        );
    } finally {
        useStore.getState().patch({ exporting: false });
    }
}