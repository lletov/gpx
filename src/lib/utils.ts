import type { TrackPoint } from './gpx';

/** Равномерное прореживание до maxPoints точек (для градиента и производительности) */
export function decimate<T>(pts: T[], maxPoints: number): T[] {
    if (pts.length <= maxPoints) return pts;
    const out: T[] = [];
    const step = (pts.length - 1) / (maxPoints - 1);
    for (let i = 0; i < maxPoints; i++) out.push(pts[Math.round(i * step)]);
    return out;
}

function hexToRgb(hex: string): [number, number, number] {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpColor(a: string, b: string, t: number): string {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(
        b1 + (b2 - b1) * t
    )})`;
}

export function trackDistanceMeters(pts: TrackPoint[]): number {
    const R = 6371000;
    const rad = Math.PI / 180;
    let d = 0;
    for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const dLat = (b.lat - a.lat) * rad;
        const dLon = (b.lon - a.lon) * rad;
        const s =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
        d += 2 * R * Math.asin(Math.sqrt(s));
    }
    return d;
}