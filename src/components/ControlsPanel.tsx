import type { ReactNode } from 'react';
import { Download, Map as MapIcon, MapPin, Palette, Upload } from 'lucide-react';
import { useStore } from '../store';
import type { MapFilter } from '../store';
import { TILE_PROVIDERS } from '../lib/tiles';
import { trackDistanceMeters } from '../lib/utils';

const selectCls =
    'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[13px] text-slate-100 outline-none transition-colors focus:border-sky-400';
const colorCls = 'h-8 w-12 shrink-0 cursor-pointer rounded-md border border-slate-700 bg-slate-800 p-0.5';
const rangeCls = 'w-32 cursor-pointer accent-sky-400 sm:w-40';
const checkboxCls = 'h-4 w-4 shrink-0 cursor-pointer accent-sky-400';

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section className="border-t border-slate-800 py-4 first:border-t-0 first:pt-1">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {icon}
                {title}
            </h3>
            <div className="space-y-2.5">{children}</div>
        </section>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex min-h-8 items-center justify-between gap-3 text-[13px] text-slate-200">
            <span className="shrink-0">{label}</span>
            {children}
        </div>
    );
}

export default function ControlsPanel() {
    const s = useStore();
    const km = trackDistanceMeters(s.track) / 1000;

    return (
        <div>
            <Section title="Файл" icon={<Upload size={14} />}>
                <label className="block cursor-pointer">
                    <input
                        type="file"
                        accept=".gpx,application/gpx+xml"
                        className="peer sr-only"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void s.loadFile(f);
                            e.target.value = '';
                        }}
                    />
                    <span className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-800/60 px-3 py-3 text-[13px] text-slate-300 transition-colors hover:border-sky-400 hover:text-slate-100 peer-focus-visible:border-sky-400">
                        <Upload size={15} />
                        Выбрать GPX-файл
                    </span>
                </label>
                {s.track.length > 0 ? (
                    <div className="rounded-lg bg-slate-800/70 px-3 py-2 text-xs leading-relaxed text-slate-300">
                        {s.trackName ?? s.fileName} — {s.track.length} точек · {km.toFixed(1)} км
                    </div>
                ) : (
                    <p className="text-xs leading-relaxed text-slate-500">
                        Или просто перетащите файл на карту. Пример: sample/track.gpx
                    </p>
                )}
            </Section>

            <Section title="Линия" icon={<Palette size={14} />}>
                <Row label="Градиент">
                    <input type="checkbox" className={checkboxCls} checked={s.gradientEnabled}
                        onChange={(e) => s.patch({ gradientEnabled: e.target.checked })} />
                </Row>
                {s.gradientEnabled ? (
                    <>
                        <Row label="Цвет «от»">
                            <input type="color" className={colorCls} value={s.gradientFrom}
                                onChange={(e) => s.patch({ gradientFrom: e.target.value })} />
                        </Row>
                        <Row label="Цвет «до»">
                            <input type="color" className={colorCls} value={s.gradientTo}
                                onChange={(e) => s.patch({ gradientTo: e.target.value })} />
                        </Row>
                    </>
                ) : (
                    <Row label="Цвет">
                        <input type="color" className={colorCls} value={s.lineColor}
                            onChange={(e) => s.patch({ lineColor: e.target.value })} />
                    </Row>
                )}
                <Row label={`Толщина: ${s.lineWidth}px`}>
                    <input type="range" className={rangeCls} min={1} max={14} value={s.lineWidth}
                        onChange={(e) => s.patch({ lineWidth: +e.target.value })} />
                </Row>
                <Row label="Обводка">
                    <input type="checkbox" className={checkboxCls} checked={s.casingEnabled}
                        onChange={(e) => s.patch({ casingEnabled: e.target.checked })} />
                </Row>
                {s.casingEnabled && (
                    <>
                        <Row label="Цвет обводки">
                            <input type="color" className={colorCls} value={s.casingColor}
                                onChange={(e) => s.patch({ casingColor: e.target.value })} />
                        </Row>
                        <Row label={`Ширина: ${s.casingWidth}px`}>
                            <input type="range" className={rangeCls} min={1} max={8} value={s.casingWidth}
                                onChange={(e) => s.patch({ casingWidth: +e.target.value })} />
                        </Row>
                    </>
                )}
            </Section>

            <Section title="Подложка" icon={<MapIcon size={14} />}>
                <Row label="Показывать">
                    <input type="checkbox" className={checkboxCls} checked={s.mapVisible}
                        onChange={(e) => s.patch({ mapVisible: e.target.checked })} />
                </Row>
                {s.mapVisible && (
                    <>
                        <select className={selectCls} value={s.providerId}
                            onChange={(e) => s.patch({ providerId: e.target.value })}>
                            {TILE_PROVIDERS.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <Row label={`Прозрачность: ${Math.round(s.mapOpacity * 100)}%`}>
                            <input type="range" className={rangeCls} min={10} max={100}
                                value={Math.round(s.mapOpacity * 100)}
                                onChange={(e) => s.patch({ mapOpacity: +e.target.value / 100 })} />
                        </Row>
                        <select className={selectCls} value={s.mapFilter}
                            onChange={(e) => s.patch({ mapFilter: e.target.value as MapFilter })}>
                            <option value="none">Без фильтра</option>
                            <option value="grayscale">Чёрно-белый</option>
                            <option value="sepia">Сепия</option>
                            <option value="invert">Инверсия</option>
                        </select>
                    </>
                )}
            </Section>

            <Section title="Точки (wpt)" icon={<MapPin size={14} />}>
                <Row label="Показывать">
                    <input type="checkbox" className={checkboxCls} checked={s.pointsVisible}
                        onChange={(e) => s.patch({ pointsVisible: e.target.checked })} />
                </Row>
                {s.pointsVisible && (
                    <>
                        <Row label={`Радиус: ${s.pointRadius}px`}>
                            <input type="range" className={rangeCls} min={2} max={12} value={s.pointRadius}
                                onChange={(e) => s.patch({ pointRadius: +e.target.value })} />
                        </Row>
                        <Row label="Цвет">
                            <input type="color" className={colorCls} value={s.pointColor}
                                onChange={(e) => s.patch({ pointColor: e.target.value })} />
                        </Row>
                    </>
                )}
                {s.track.length > 0 && s.waypoints.length === 0 && (
                    <p className="text-xs text-slate-500">В этом треке нет точек wpt</p>
                )}
            </Section>

            <Section title="Экспорт" icon={<Download size={14} />}>
                <Row label="Масштаб картинки">
                    <select
                        className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-[13px] text-slate-100 outline-none focus:border-sky-400"
                        value={s.exportScale}
                        onChange={(e) => s.patch({ exportScale: +e.target.value })}
                    >
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={3}>3x</option>
                    </select>
                </Row>
                <p className="text-xs leading-relaxed text-slate-500">
                    Экспортируется текущий вид карты. С выключенной подложкой получится PNG с прозрачным фоном.
                </p>
            </Section>

            <footer className="border-t border-slate-800 pb-2 pt-3 text-[11px] leading-relaxed text-slate-500">
                Картографические данные: © участники OpenStreetMap, © CARTO, Tiles © Esri, OpenTopoMap (CC-BY-SA)
            </footer>
        </div>
    );
}