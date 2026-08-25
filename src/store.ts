import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ReactNode } from 'react';
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

export const DEFAULT_SETTINGS = {
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
    mapFilter: 'none' as MapFilter,
    pointsVisible: true,
    pointRadius: 5,
    pointColor: '#f59e0b',
    exportScale: 2,
};

export type Settings = typeof DEFAULT_SETTINGS;

export interface Favorite {
    id: string;
    name: string;
    settings: Settings;
    createdAt: number;
}

export interface ModalConfig {
    title?: string;
    icon?: ReactNode;
    content: ReactNode;
    confirmText: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'danger';
    onConfirm?: () => void;
    onCancel?: () => void;
}

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

    sheetOpen: boolean;
    mapInstance: LMap | null;

    favorites: Favorite[];
    modal: ModalConfig | null;

    patch: (p: Partial<AppState>) => void;
    loadFile: (f: File) => Promise<void>;
    resetSettings: () => void;
    addFavorite: (name: string) => void;
    removeFavorite: (id: string) => void;
    applyFavorite: (id: string) => void;
    openModal: (cfg: ModalConfig) => void;
    closeModal: () => void;
}

const pickSettings = (s: AppState): Settings => ({
    lineColor: s.lineColor,
    lineWidth: s.lineWidth,
    casingEnabled: s.casingEnabled,
    casingColor: s.casingColor,
    casingWidth: s.casingWidth,
    gradientEnabled: s.gradientEnabled,
    gradientFrom: s.gradientFrom,
    gradientTo: s.gradientTo,
    providerId: s.providerId,
    mapVisible: s.mapVisible,
    mapOpacity: s.mapOpacity,
    mapFilter: s.mapFilter,
    pointsVisible: s.pointsVisible,
    pointRadius: s.pointRadius,
    pointColor: s.pointColor,
    exportScale: s.exportScale,
});

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            track: [],
            waypoints: [],
            trackName: null,
            fileName: null,

            ...DEFAULT_SETTINGS,

            exporting: false,
            sheetOpen: false,
            mapInstance: null,

            favorites: [],
            modal: null,

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

            resetSettings: () => set({ ...DEFAULT_SETTINGS }),

            addFavorite: (name) =>
                set((s) => ({
                    favorites: [
                        ...s.favorites,
                        { id: crypto.randomUUID(), name, settings: pickSettings(s), createdAt: Date.now() },
                    ],
                })),

            removeFavorite: (id) => set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),

            applyFavorite: (id) =>
                set((s) => {
                    const fav = s.favorites.find((f) => f.id === id);
                    return fav ? { ...fav.settings } : {};
                }),

            openModal: (cfg) => set({ modal: cfg }),
            closeModal: () => set({ modal: null }),
        }),
        {
            name: 'gpx-visualizer',
            storage: createJSONStorage(() => localStorage),
            // из всего стора персистим только избранное
            partialize: (s) => ({ favorites: s.favorites }),
        }
    )
);