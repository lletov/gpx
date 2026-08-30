export interface TileProvider {
    id: string;
    name: string;
    url: string;
    attribution: string;
    maxNativeZoom: number;
}

export const TILE_PROVIDERS: TileProvider[] = [
    {
        id: 'osm-standard',
        name: 'OSM Standard',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        maxNativeZoom: 19,
    },
    {
        id: 'esri-light',
        name: 'Esri Light Gray (светлая)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri',
        maxNativeZoom: 19,
    },
    {
        id: 'esri-dark',
        name: 'Esri Dark Gray (тёмная)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri',
        maxNativeZoom: 19,
    },
    {
        id: 'esri-topo',
        name: 'Esri World Topo Map',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri',
        maxNativeZoom: 19,
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