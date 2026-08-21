import { create } from 'zustand';
import type { Map as LMap } from 'leaflet';
import type { TrackPoint, Waypoint } from './lib/gpx';
import { parseGpxFile } from './lib/gpx';
import { TILE_PROVIDERS } from './lib/tiles';

export type MapFilter = 'none' | 'grayscale' | 'sepia' | 'invert';

export const FILTER_CSS: Record<MapFilter, string> = {
    none: '',
    grayscale: 'grayscale(1) contrast(1.05)',
    sepia: 'sepia(0.85)',
    invert: 'invert(1) hue-rotate(180deg)',
};

export interface AppState {
    track: TrackPoint[];
    waypoints: Waypoint[];
    trackName: string | null;
    fileName: string | null;

    lineColor: string;
    lineWidth: number;
    casingEnabled: boolean;
    casingColor: string;
    casingWidth: number;
    gradientEnabled: boolean;
    gradientFrom: string;
    gradientTo: string;

    providerId: string;
    mapVisible: boolean;
    mapOpacity: number;
    mapFilter: MapFilter;

    pointsVisible: boolean;
    pointRadius: number;
    pointColor: string;

    exportScale: number;
    exporting: boolean;

    // служебное
    sheetOpen: boolean;
    mapInstance: LMap | null;

    patch: (p: Partial<AppState>) => void;
    loadFile: (f: File) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
    track: [],
    waypoints: [],
    trackName: null,
    fileName: null,

    lineColor: '#e11d48',
    lineWidth: 4,
    casingEnabled: true,
    casingColor: '#ffffff',
    casingWidth: 2,
    gradientEnabled: false,
    gradientFrom: '#22c55e',
    gradientTo: '#ef4444',

    providerId: TILE_PROVIDERS[0].id,
    mapVisible: true,
    mapOpacity: 1,
    mapFilter: 'none',

    pointsVisible: true,
    pointRadius: 5,
    pointColor: '#f59e0b',

    exportScale: 2,
    exporting: false,

    sheetOpen: false,
    mapInstance: null,

    patch: (p) => set(p),

    loadFile: async (f) => {
        try {
            const { track, waypoints, name } = await parseGpxFile(f);
            if (!track.length) throw new Error('в файле нет точек трека (trkpt/rtept)');
            // шторку сворачиваем, чтобы трек было видно сразу
            set({ track, waypoints, trackName: name ?? null, fileName: f.name, sheetOpen: false });
        } catch (e) {
            alert('Не удалось прочитать файл: ' + (e as Error).message);
        }
    },
}));