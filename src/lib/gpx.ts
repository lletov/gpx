export interface TrackPoint {
    lat: number;
    lon: number;
    ele?: number;
    time?: number;
}

export interface Waypoint extends TrackPoint {
    name?: string;
}

export interface ParsedGpx {
    track: TrackPoint[];
    waypoints: Waypoint[];
    name?: string;
}

export const GPX_LIMITS = {
    maxFileBytes: 20 * 1024 * 1024,
    maxTrackPoints: 100_000,
    maxWaypoints: 10_000,
    maxTextLength: 200,
} as const;

function getElementsByLocalName(root: Document | Element, name: string): Element[] {
    return Array.from(root.getElementsByTagNameNS('*', name));
}

function getFirstElementByLocalName(root: Document | Element, name: string): Element | undefined {
    return getElementsByLocalName(root, name)[0];
}

function readRequiredCoordinate(
    element: Element,
    name: 'lat' | 'lon',
    min: number,
    max: number,
): number {
    const raw = element.getAttribute(name);

    if (raw == null || raw.trim() === '') {
        throw new Error(`у точки отсутствует атрибут "${name}"`);
    }

    const value = Number(raw);

    if (!Number.isFinite(value)) {
        throw new Error(`некорректное значение "${name}"`);
    }

    if (value < min || value > max) {
        throw new Error(`значение "${name}" должно быть от ${min} до ${max}`);
    }

    return value;
}

function readOptionalNumber(element: Element, name: string): number | undefined {
    const child = getFirstElementByLocalName(element, name);
    const raw = child?.textContent?.trim();

    if (!raw) return undefined;

    const value = Number(raw);

    if (!Number.isFinite(value)) {
        throw new Error(`некорректное числовое значение "${name}"`);
    }

    return value;
}

function readOptionalTime(element: Element): number | undefined {
    const child = getFirstElementByLocalName(element, 'time');
    const raw = child?.textContent?.trim();

    if (!raw) return undefined;

    const timestamp = Date.parse(raw);

    if (Number.isNaN(timestamp)) {
        throw new Error(`некорректное значение времени "${raw}"`);
    }

    return timestamp;
}

function readOptionalText(element: Document | Element, name: string): string | undefined {
    const child = getFirstElementByLocalName(element, name);
    const value = child?.textContent?.trim();

    if (!value) return undefined;

    return value.slice(0, GPX_LIMITS.maxTextLength);
}

function parseTrackPoint(element: Element): TrackPoint {
    return {
        lat: readRequiredCoordinate(element, 'lat', -90, 90),
        lon: readRequiredCoordinate(element, 'lon', -180, 180),
        ele: readOptionalNumber(element, 'ele'),
        time: readOptionalTime(element),
    };
}

function parseWaypoint(element: Element): Waypoint {
    return {
        lat: readRequiredCoordinate(element, 'lat', -90, 90),
        lon: readRequiredCoordinate(element, 'lon', -180, 180),
        ele: readOptionalNumber(element, 'ele'),
        name: readOptionalText(element, 'name'),
    };
}

export function parseGpx(text: string): ParsedGpx {
    if (!text.trim()) {
        throw new Error('GPX-файл пуст');
    }

    // parseGpx также может использоваться напрямую, без File API.
    // Blob позволяет применить тот же лимит к строке в UTF-8.
    if (new Blob([text]).size > GPX_LIMITS.maxFileBytes) {
        throw new Error(
            `GPX-файл слишком большой. Максимальный размер: ${Math.round(GPX_LIMITS.maxFileBytes / 1024 / 1024)} МБ`,
        );
    }

    const doc = new DOMParser().parseFromString(text, 'application/xml');

    if (doc.querySelector('parsererror')) {
        throw new Error('файл не является корректным XML/GPX');
    }

    const root = doc.documentElement;

    if (!root || root.localName.toLowerCase() !== 'gpx') {
        throw new Error('файл не является GPX');
    }

    // Сохраняем прежнюю семантику: если есть trkpt, используем их;
    // иначе используем rtept.
    const trkpts = getElementsByLocalName(doc, 'trkpt');
    const rtepts = getElementsByLocalName(doc, 'rtept');
    const pointElements = trkpts.length ? trkpts : rtepts;
    const waypointElements = getElementsByLocalName(doc, 'wpt');

    if (pointElements.length > GPX_LIMITS.maxTrackPoints) {
        throw new Error(
            `слишком много точек трека. Максимум: ${GPX_LIMITS.maxTrackPoints.toLocaleString('ru-RU')}`,
        );
    }

    if (waypointElements.length > GPX_LIMITS.maxWaypoints) {
        throw new Error(
            `слишком много waypoint-точек. Максимум: ${GPX_LIMITS.maxWaypoints.toLocaleString('ru-RU')}`,
        );
    }

    const track = pointElements.map(parseTrackPoint);
    const waypoints = waypointElements.map(parseWaypoint);

    const firstTrack = getFirstElementByLocalName(doc, 'trk');
    const name = firstTrack ? readOptionalText(firstTrack, 'name') : undefined;

    return { track, waypoints, name };
}

export async function parseGpxFile(file: File): Promise<ParsedGpx> {
    if (file.size > GPX_LIMITS.maxFileBytes) {
        throw new Error(
            `файл слишком большой. Максимальный размер: ${Math.round(GPX_LIMITS.maxFileBytes / 1024 / 1024)} МБ`,
        );
    }

    return parseGpx(await file.text());
}
