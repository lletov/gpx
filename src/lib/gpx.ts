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

export function parseGpx(text: string): ParsedGpx {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.querySelector('parsererror')) {
        throw new Error('файл не является корректным XML/GPX');
    }

    const attr = (el: Element, name: string) => {
        const v = el.getAttribute(name);
        if (v == null) throw new Error(`у точки отсутствует атрибут "${name}"`);
        return parseFloat(v);
    };
    const num = (parent: Element, tag: string) => {
        const el = parent.getElementsByTagName(tag)[0];
        return el?.textContent ? parseFloat(el.textContent) : undefined;
    };

    let trkpts = Array.from(doc.getElementsByTagName('trkpt'));
    if (!trkpts.length) trkpts = Array.from(doc.getElementsByTagName('rtept'));

    const track: TrackPoint[] = trkpts.map((el) => {
        const t = el.getElementsByTagName('time')[0]?.textContent;
        return {
            lat: attr(el, 'lat'),
            lon: attr(el, 'lon'),
            ele: num(el, 'ele'),
            time: t ? Date.parse(t) : undefined,
        };
    });

    const waypoints: Waypoint[] = Array.from(doc.getElementsByTagName('wpt')).map((el) => ({
        lat: attr(el, 'lat'),
        lon: attr(el, 'lon'),
        ele: num(el, 'ele'),
        name: el.getElementsByTagName('name')[0]?.textContent ?? undefined,
    }));

    const trk = doc.getElementsByTagName('trk')[0];
    const name = trk?.getElementsByTagName('name')[0]?.textContent ?? undefined;

    return { track, waypoints, name };
}