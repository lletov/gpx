import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    BookmarkPlus, Download, Map as MapIcon, MapPin, Palette, RotateCcw, Star, Trash2, Upload,
} from 'lucide-react';
import type { Favorite, MapFilter } from '../store';
import { TILE_PROVIDERS } from '../lib/tiles';
import { trackDistanceMeters } from '../lib/utils';
import { DEFAULT_SETTINGS, pickSettings, settingsEqual, useStore } from '../store';

const selectCls =
    'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[13px] text-slate-100 outline-none transition-colors focus:border-sky-400';
const colorCls = 'h-8 w-12 shrink-0 cursor-pointer rounded-md border border-slate-700 bg-slate-800 p-0.5';
const rangeCls = 'w-32 cursor-pointer accent-sky-400 sm:w-40';
const checkboxCls = 'h-4 w-4 shrink-0 cursor-pointer accent-sky-400';

function Section({
    title,
    icon,
    action,
    children,
}: {
    title: string;
    icon: ReactNode;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="border-t border-slate-800 py-4 first:border-t-0 first:pt-1">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {icon}
                    {title}
                </h3>
                {action}
            </div>
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

function NameInput({ defaultValue, onChange }: { defaultValue: string; onChange: (value: string) => void }) {
    const [value, setValue] = useState(defaultValue);
    return (
        <input
            autoFocus
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
                onChange(e.target.value);
            }}
            onFocus={(e) => e.target.select()}
            placeholder="Название пресета"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-sky-400"
        />
    );
}

export default function ControlsPanel() {
    const s = useStore();
    const km = trackDistanceMeters(s.track) / 1000;
    const currentSettings = pickSettings(s);
    const isDefault = settingsEqual(currentSettings, DEFAULT_SETTINGS);
    const alreadyFavorited = s.favorites.some((f) => settingsEqual(f.settings, currentSettings));

    const confirmReset = () =>
        s.openModal({
            title: 'Сбросить настройки',
            icon: <RotateCcw size={16} className="text-amber-400" />,
            content: (
                <p>
                    Все настройки линии, подложки и точек вернутся к начальным значениям. Загруженный трек и
                    избранное останутся без изменений.
                </p>
            ),
            confirmText: 'Сбросить',
            cancelText: 'Отмена',
            confirmVariant: 'danger',
            onConfirm: () => useStore.getState().resetSettings(),
        });

    const openSaveFavorite = () => {
        let name = `Пресет ${s.favorites.length + 1}`;
        s.openModal({
            title: 'Сохранить в избранное',
            icon: <Star size={16} className="text-amber-400" />,
            content: <NameInput defaultValue={name} onChange={(v) => (name = v)} />,
            confirmText: 'Сохранить',
            cancelText: 'Отмена',
            onConfirm: () => {
                const st = useStore.getState();
                st.addFavorite(name.trim() || `Пресет ${st.favorites.length + 1}`);
            },
        });
    };

    const confirmDeleteFavorite = (f: Favorite) =>
        s.openModal({
            title: 'Удалить из избранного',
            icon: <Trash2 size={16} className="text-red-400" />,
            content: (
                <p>
                    Удалить пресет <span className="font-semibold text-slate-100">«{f.name}»</span>? Это действие
                    нельзя отменить.
                </p>
            ),
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            confirmVariant: 'danger',
            onConfirm: () => useStore.getState().removeFavorite(f.id),
        });

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

            <Section
                title="Подложка"
                icon={<MapIcon size={14} />}
                action={
                    <input
                        type="checkbox"
                        className={checkboxCls}
                        checked={s.mapVisible}
                        onChange={(e) => s.patch({ mapVisible: e.target.checked })}
                        aria-label="Показывать подложку"
                    />
                }
            >
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

            <Section
                title="Точки (wpt)"
                icon={<MapPin size={14} />}
                action={
                    <input
                        type="checkbox"
                        className={checkboxCls}
                        checked={s.pointsVisible}
                        onChange={(e) => s.patch({ pointsVisible: e.target.checked })}
                        aria-label="Показывать точки"
                    />
                }
            >
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
                {s.pointsVisible && s.track.length > 0 && s.waypoints.length === 0 && (
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
            <Section title="Избранное" icon={<Star size={14} />}>
                <button
                    onClick={openSaveFavorite}
                    disabled={alreadyFavorited}
                    title={
                        alreadyFavorited
                            ? 'Текущие настройки уже есть в избранном'
                            : 'Сохранить текущие настройки как пресет'
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-800/60 px-3 py-2.5 text-[13px] text-slate-300 transition-colors hover:border-sky-400 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <BookmarkPlus size={15} />
                    Сохранить текущие настройки
                </button>
                {s.favorites.length === 0 ? (
                    <p className="text-xs leading-relaxed text-slate-500">
                        Сохраняйте пресеты стиля и применяйте их в один клик
                    </p>
                ) : (
                    <ul className="space-y-1.5">
                        {s.favorites.map((f) => (
                            <li key={f.id} className="flex items-center gap-1 rounded-lg bg-slate-800/70 py-1 pl-3 pr-1.5">
                                <button
                                    onClick={() => s.applyFavorite(f.id)}
                                    className="min-w-0 flex-1 truncate text-left text-[13px] text-slate-200 transition-colors hover:text-sky-300"
                                    title="Применить пресет"
                                >
                                    {f.name}
                                </button>
                                <button
                                    onClick={() => confirmDeleteFavorite(f)}
                                    className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-red-400"
                                    aria-label={`Удалить пресет ${f.name}`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
            <button
                onClick={confirmReset}
                disabled={isDefault}
                title={
                    isDefault
                        ? 'Настройки уже соответствуют начальным значениям'
                        : 'Сбросить все настройки'
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-[13px] text-slate-300 transition-colors hover:border-red-400/60 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <RotateCcw size={14} />
                Сбросить к начальным значениям
            </button>

            <footer className="border-t border-slate-800 pb-2 pt-3 text-[11px] leading-relaxed text-slate-500">
                Картографические данные: © участники OpenStreetMap, © CARTO, Tiles © Esri, OpenTopoMap (CC-BY-SA)
            </footer>
        </div>
    );
}