export interface TileProvider {
    id: string;
    name: string;
    url: string;
    attribution: string;
    maxNativeZoom: number;
}

// Важны провайдеры, отдающие Access-Control-Allow-Origin — иначе canvas-экспорт упадёт
export const TILE_PROVIDERS: TileProvider[] = [
    {
        id: 'carto-voyager',
        name: 'CARTO Voyager',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxNativeZoom: 20,
    },
    {
        id: 'carto-light',
        name: 'CARTO Positron (светлая)',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxNativeZoom: 20,
    },
    {
        id: 'carto-dark',
        name: 'CARTO Dark Matter (тёмная)',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxNativeZoom: 20,
    },
    {
        id: 'esri-imagery',
        name: 'Esri Спутник',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri',
        maxNativeZoom: 19,
    },
    {
        id: 'opentopo',
        name: 'OpenTopoMap (рельеф)',
        url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors, SRTM | style © OpenTopoMap (CC-BY-SA)',
        maxNativeZoom: 17,
    },
];