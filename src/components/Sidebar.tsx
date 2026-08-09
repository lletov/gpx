import type { ReactNode } from 'react';
import { Download, Map as MapIcon, MapPin, Palette, Upload } from 'lucide-react';
import { useStore } from '../store';
import type { MapFilter } from '../store';
import { TILE_PROVIDERS } from '../lib/tiles';
import { trackDistanceMeters } from '../lib/utils';

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section className="section">
            <h3>
                {icon}
                {title}
            </h3>
            {children}
        </section>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="row">
            <span>{label}</span>
            {children}
        </div>
    );
}

export default function Sidebar() {
    const s = useStore();
    const km = trackDistanceMeters(s.track) / 1000;

    return (
        <aside className="sidebar">
            <h1>GPX Visualizer</h1>

            <Section title="Файл" icon={<Upload size={15} />}>
                <input
                    type="file"
                    accept=".gpx,application/gpx+xml"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void s.loadFile(f);
                        e.target.value = '';
                    }}
                />
                {s.track.length > 0 ? (
                    <div className="hint">
                        {s.trackName ?? s.fileName} · {s.track.length} точек · {km.toFixed(1)} км
                    </div>
                ) : (
                    <div className="hint">Загрузите GPX или перетащите файл на карту. Пример: sample/track.gpx</div>
                )}
            </Section>

            <Section title="Линия" icon={<Palette size={15} />}>
                <Row label="Градиент">
                    <input
                        type="checkbox"
                        checked={s.gradientEnabled}
                        onChange={(e) => s.patch({ gradientEnabled: e.target.checked })}
                    />
                </Row>
                {s.gradientEnabled ? (
                    <>
                        <Row label="Цвет «от»">
                            <input type="color" value={s.gradientFrom} onChange={(e) => s.patch({ gradientFrom: e.target.value })} />
                        </Row>
                        <Row label="Цвет «до»">
                            <input type="color" value={s.gradientTo} onChange={(e) => s.patch({ gradientTo: e.target.value })} />
                        </Row>
                    </>
                ) : (
                    <Row label="Цвет">
                        <input type="color" value={s.lineColor} onChange={(e) => s.patch({ lineColor: e.target.value })} />
                    </Row>
                )}
                <Row label={`Толщина: ${s.lineWidth}px`}>
                    <input type="range" min={1} max={14} value={s.lineWidth} onChange={(e) => s.patch({ lineWidth: +e.target.value })} />
                </Row>
                <Row label="Обводка">
                    <input type="checkbox" checked={s.casingEnabled} onChange={(e) => s.patch({ casingEnabled: e.target.checked })} />
                </Row>
                {s.casingEnabled && (
                    <>
                        <Row label="Цвет обводки">
                            <input type="color" value={s.casingColor} onChange={(e) => s.patch({ casingColor: e.target.value })} />
                        </Row>
                        <Row label={`Ширина: ${s.casingWidth}px`}>
                            <input type="range" min={1} max={8} value={s.casingWidth} onChange={(e) => s.patch({ casingWidth: +e.target.value })} />
                        </Row>
                    </>
                )}
            </Section>

            <Section title="Подложка" icon={<MapIcon size={15} />}>
                <Row label="Показывать">
                    <input type="checkbox" checked={s.mapVisible} onChange={(e) => s.patch({ mapVisible: e.target.checked })} />
                </Row>
                {s.mapVisible && (
                    <>
                        <select value={s.providerId} onChange={(e) => s.patch({ providerId: e.target.value })}>
                            {TILE_PROVIDERS.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <Row label={`Прозрачность: ${Math.round(s.mapOpacity * 100)}%`}>
                            <input
                                type="range"
                                min={10}
                                max={100}
                                value={Math.round(s.mapOpacity * 100)}
                                onChange={(e) => s.patch({ mapOpacity: +e.target.value / 100 })}
                            />
                        </Row>
                        <select value={s.mapFilter} onChange={(e) => s.patch({ mapFilter: e.target.value as MapFilter })}>
                            <option value="none">Без фильтра</option>
                            <option value="grayscale">Чёрно-белый</option>
                            <option value="sepia">Сепия</option>
                            <option value="invert">Инверсия</option>
                        </select>
                    </>
                )}
            </Section>

            <Section title="Точки (wpt)" icon={<MapPin size={15} />}>
                <Row label="Показывать">
                    <input type="checkbox" checked={s.pointsVisible} onChange={(e) => s.patch({ pointsVisible: e.target.checked })} />
                </Row>
                {s.pointsVisible && (
                    <>
                        <Row label={`Радиус: ${s.pointRadius}px`}>
                            <input type="range" min={2} max={12} value={s.pointRadius} onChange={(e) => s.patch({ pointRadius: +e.target.value })} />
                        </Row>
                        <Row label="Цвет">
                            <input type="color" value={s.pointColor} onChange={(e) => s.patch({ pointColor: e.target.value })} />
                        </Row>
                    </>
                )}
                {s.waypoints.length === 0 && <div className="hint">В загруженном треке нет точек wpt</div>}
            </Section>

            <Section title="Экспорт" icon={<Download size={15} />}>
                <Row label="Масштаб картинки">
                    <select value={s.exportScale} onChange={(e) => s.patch({ exportScale: +e.target.value })}>
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={3}>3x</option>
                    </select>
                </Row>
                <div className="hint">
                    Экспортируется текущий вид карты. С выключенной подложкой получится PNG с прозрачным фоном.
                </div>
            </Section>
        </aside>
    );
}