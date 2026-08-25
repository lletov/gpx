import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    BookmarkPlus, Check, CircleUser, Crown, Download, Mail, Map as MapIcon, MapPin, MessageSquare,
    Palette, Play, RotateCcw, Settings, Share2, Star, Trash2, Upload,
} from 'lucide-react';
import { DEFAULT_SETTINGS, PRESET_LIMIT, pickSettings, settingsEqual, useStore } from '../store';
import type { Favorite, GradientMode, MapFilter, Theme } from '../store';
import { useT } from '../lib/i18n';
import type { Lang } from '../lib/i18n';
import { TILE_PROVIDERS } from '../lib/tiles';
import { hasElevation, trackDistanceMeters } from '../lib/utils';

const selectCls =
    'w-full rounded-lg border border-line bg-input px-3 py-2 text-[13px] text-main outline-none transition-colors focus:border-sky-400';
const inputCls =
    'w-full rounded-lg border border-line bg-input px-3 py-2 text-[13px] text-main outline-none transition-colors focus:border-sky-400';
const colorCls = 'h-8 w-12 shrink-0 cursor-pointer rounded-md border border-line bg-input p-0.5';
const rangeCls = 'w-32 cursor-pointer accent-sky-400 sm:w-40';
const checkboxCls = 'h-4 w-4 shrink-0 cursor-pointer accent-sky-400';
const actionBtnCls =
    'flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-input px-3 py-2 text-[13px] text-dim transition-colors hover:bg-hover hover:text-main';

function Section({
    title, icon, action, children,
}: {
    title: string; icon: ReactNode; action?: ReactNode; children: ReactNode;
}) {
    return (
        <section className="border-t border-line py-4 first:border-t-0 first:pt-1">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
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
        <div className="flex min-h-8 items-center justify-between gap-3 text-[13px] text-dim">
            <span className="shrink-0">{label}</span>
            {children}
        </div>
    );
}

function NameInput({
    defaultValue, existingNames, onChange,
}: {
    defaultValue: string;
    existingNames: string[];
    onChange: (value: string, valid: boolean) => void;
}) {
    const t = useT();
    const [value, setValue] = useState(defaultValue);

    const error = useMemo(() => {
        const v = value.trim();
        if (v && existingNames.some((n) => n.trim().toLowerCase() === v.toLowerCase())) {
            return t('presetNameDuplicate');
        }
        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, existingNames]);

    useEffect(() => {
        onChange(value, error == null);
    }, [value, error, onChange]);

    return (
        <div>
            <input
                autoFocus
                maxLength={30}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder={t('presetNamePlaceholder')}
                className={`w-full rounded-lg border bg-input px-3 py-2 text-sm text-main outline-none transition-colors ${error ? 'border-red-400' : 'border-line focus:border-sky-400'
                    }`}
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className={error ? 'text-red-400' : 'text-transparent'}>{error ?? '.'}</span>
                <span className="text-muted">{value.length}/30</span>
            </div>
        </div>
    );
}

function FeedbackForm({ onChange }: { onChange: (message: string) => void }) {
    const t = useT();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    return (
        <div className="space-y-2.5">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('yourEmail')}
                className={inputCls}
            />
            <textarea
                rows={4}
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={t('yourMessage')}
                className={`${inputCls} resize-none`}
            />
        </div>
    );
}

export default function ControlsPanel() {
    const s = useStore();
    const t = useT();
    const [copied, setCopied] = useState(false);

    const hasTrack = s.track.length > 0;
    const km = trackDistanceMeters(s.track) / 1000;

    const currentSettings = pickSettings(s);
    const isDefault = settingsEqual(currentSettings, DEFAULT_SETTINGS);
    const alreadyFavorited =
        isDefault || s.favorites.some((f) => settingsEqual(f.settings, currentSettings));
    const limitReached = !s.premium && s.favorites.length >= PRESET_LIMIT;
    const hasElev = useMemo(() => hasElevation(s.track), [s.track]);
    // Режим, который реально применяется: без данных о высоте — всегда «по длине»
    const gradientMode = hasElev ? s.gradientMode : 'length';

    /* ---------- обработчики ---------- */

    const confirmDeleteFile = () =>
        s.openModal({
            title: t('deleteFileTitle'),
            icon: <Trash2 size={16} className="text-red-400" />,
            content: <p>{t('deleteFileText')}</p>,
            confirmText: t('delete'),
            cancelText: t('cancel'),
            confirmVariant: 'danger',
            onConfirm: () => useStore.getState().deleteTrack(),
        });

    const handleLoadSample = async () => {
        const ok = await useStore.getState().loadSample();
        if (!ok) useStore.getState().showToast(t('sampleLoadError'));
    };

    const confirmReset = () =>
        s.openModal({
            title: t('resetTitle'),
            icon: <RotateCcw size={16} className="text-amber-400" />,
            content: <p>{t('resetText')}</p>,
            confirmText: t('reset'),
            cancelText: t('cancel'),
            confirmVariant: 'danger',
            onConfirm: () => useStore.getState().resetSettings(),
        });

    const openSaveFavorite = () => {
        if (alreadyFavorited) return;

        // Лимит пресетов на бесплатном плане: показываем модалку про премиум
        if (!s.premium && s.favorites.length >= PRESET_LIMIT) {
            s.openModal({
                title: t('premiumTitle'),
                icon: <Crown size={16} className="text-amber-400" />,
                content: <p>{t('premiumText', { limit: PRESET_LIMIT })}</p>,
                confirmText: t('activatePremium'),
                cancelText: t('later'),
                onConfirm: () => {
                    useStore.getState().patch({ premium: true });
                    useStore.getState().showToast(t('premiumActivated'));
                },
            });
            return;
        }

        let name = t('presetDefaultName', { n: s.favorites.length + 1 });
        let valid = true;
        s.openModal({
            title: t('savePresetTitle'),
            icon: <Star size={16} className="text-amber-400" />,
            content: (
                <NameInput
                    defaultValue={name}
                    existingNames={s.favorites.map((f) => f.name)}
                    onChange={(v, ok) => {
                        name = v;
                        valid = ok;
                    }}
                />
            ),
            confirmText: t('savePreset'),
            cancelText: t('cancel'),
            onConfirm: () => {
                if (!valid) return false;
                const st = useStore.getState();
                st.addFavorite(name.trim() || t('presetDefaultName', { n: st.favorites.length + 1 }));
            },
        });
    };

    const confirmDeleteFavorite = (f: Favorite) =>
        s.openModal({
            title: t('deletePresetTitle'),
            icon: <Trash2 size={16} className="text-red-400" />,
            content: <p>{t('deletePresetText', { name: f.name })}</p>,
            confirmText: t('delete'),
            cancelText: t('cancel'),
            confirmVariant: 'danger',
            onConfirm: () => useStore.getState().removeFavorite(f.id),
        });

    const openFeedbackModal = () => {
        let message = '';
        s.openModal({
            title: t('feedbackTitle'),
            icon: <Mail size={16} className="text-sky-400" />,
            content: <FeedbackForm onChange={(msg) => (message = msg)} />,
            confirmText: t('send'),
            cancelText: t('cancel'),
            onConfirm: () => {
                if (!message.trim()) {
                    useStore.getState().showToast(t('enterMessage'));
                    return false;
                }
                // Здесь будет реальная отправка на бэкенд; пока имитация
                useStore.getState().showToast(t('messageSent'));
                return true;
            },
        });
    };

    const shareApp = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'GPX Visualizer', url });
                return;
            } catch (e) {
                if ((e as Error).name === 'AbortError') return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
            s.showToast(t('linkCopied'));
        } catch {
            // буфер обмена недоступен — молча выходим
        }
    };

    /* ---------- рендер ---------- */

    return (
        <div>
            {/* Файл */}
            <Section title={t('sectionFile')} icon={<Upload size={14} />}>
                {hasTrack ? (
                    <>
                        <div className="rounded-lg bg-input px-3 py-2 text-xs leading-relaxed text-dim">
                            {t('fileInfo', {
                                name: s.trackName ?? s.fileName ?? '',
                                points: s.track.length,
                                km: km.toFixed(1),
                            })}
                        </div>
                        <button
                            onClick={confirmDeleteFile}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] text-dim transition-colors hover:border-red-400/60 hover:text-red-400"
                        >
                            <Trash2 size={14} />
                            {t('deleteFile')}
                        </button>
                    </>
                ) : (
                    <>
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
                            <span className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-input px-3 py-3 text-[13px] text-dim transition-colors hover:border-sky-400 hover:text-main peer-focus-visible:border-sky-400">
                                <Upload size={15} />
                                {t('chooseFile')}
                            </span>
                        </label>
                        <button onClick={() => void handleLoadSample()} className={actionBtnCls}>
                            <Play size={15} />
                            {t('viewExample')}
                        </button>
                        <p className="text-xs leading-relaxed text-muted">{t('noTrackHint')}</p>
                    </>
                )}
            </Section>

            {/* Секции редактирования — только с загруженным треком */}
            {hasTrack && (
                <>
                    <Section title={t('sectionLine')} icon={<Palette size={14} />}>
                        <Row label={t('gradient')}>
                            <input type="checkbox" className={checkboxCls} checked={s.gradientEnabled}
                                onChange={(e) => s.patch({ gradientEnabled: e.target.checked })} />
                        </Row>
                        {s.gradientEnabled ? (
                            <>
                                <Row label={t('gradientType')}>
                                    <select
                                        className="w-36 rounded-lg border border-line bg-input px-2 py-1.5 text-[13px] text-main outline-none focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-40"
                                        value={gradientMode}
                                        disabled={!hasElev}
                                        title={!hasElev ? t('noElevationData') : undefined}
                                        onChange={(e) => s.patch({ gradientMode: e.target.value as GradientMode })}
                                    >
                                        <option value="length">{t('gradientByLength')}</option>
                                        <option value="elevation">{t('gradientByElevation')}</option>
                                    </select>
                                </Row>
                                {!hasElev && (
                                    <p className="-mt-1 text-[11px] leading-snug text-muted">{t('noElevationData')}</p>
                                )}
                                <Row label={gradientMode === 'elevation' ? t('colorFromLow') : t('colorFrom')}>
                                    <input type="color" className={colorCls} value={s.gradientFrom}
                                        onChange={(e) => s.patch({ gradientFrom: e.target.value })} />
                                </Row>
                                <Row label={gradientMode === 'elevation' ? t('colorToHigh') : t('colorTo')}>
                                    <input type="color" className={colorCls} value={s.gradientTo}
                                        onChange={(e) => s.patch({ gradientTo: e.target.value })} />
                                </Row>
                            </>
                        ) : (
                            <Row label={t('color')}>
                                <input type="color" className={colorCls} value={s.lineColor}
                                    onChange={(e) => s.patch({ lineColor: e.target.value })} />
                            </Row>
                        )}
                        <Row label={t('thickness', { px: s.lineWidth })}>
                            <input type="range" className={rangeCls} min={1} max={14} value={s.lineWidth}
                                onChange={(e) => s.patch({ lineWidth: +e.target.value })} />
                        </Row>
                        <Row label={t('casing')}>
                            <input type="checkbox" className={checkboxCls} checked={s.casingEnabled}
                                onChange={(e) => s.patch({ casingEnabled: e.target.checked })} />
                        </Row>
                        {s.casingEnabled && (
                            <>
                                <Row label={t('casingColor')}>
                                    <input type="color" className={colorCls} value={s.casingColor}
                                        onChange={(e) => s.patch({ casingColor: e.target.value })} />
                                </Row>
                                <Row label={t('casingWidth', { px: s.casingWidth })}>
                                    <input type="range" className={rangeCls} min={1} max={8} value={s.casingWidth}
                                        onChange={(e) => s.patch({ casingWidth: +e.target.value })} />
                                </Row>
                            </>
                        )}
                    </Section>

                    <Section
                        title={t('sectionMap')}
                        icon={<MapIcon size={14} />}
                        action={
                            <input type="checkbox" className={checkboxCls} checked={s.mapVisible}
                                onChange={(e) => s.patch({ mapVisible: e.target.checked })} aria-label={t('show')} />
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
                                <Row label={t('opacity', { pct: Math.round(s.mapOpacity * 100) })}>
                                    <input type="range" className={rangeCls} min={10} max={100}
                                        value={Math.round(s.mapOpacity * 100)}
                                        onChange={(e) => s.patch({ mapOpacity: +e.target.value / 100 })} />
                                </Row>
                                <select className={selectCls} value={s.mapFilter}
                                    onChange={(e) => s.patch({ mapFilter: e.target.value as MapFilter })}>
                                    <option value="none">{t('filterNone')}</option>
                                    <option value="grayscale">{t('filterGrayscale')}</option>
                                    <option value="sepia">{t('filterSepia')}</option>
                                    <option value="invert">{t('filterInvert')}</option>
                                </select>
                            </>
                        )}
                    </Section>

                    <Section
                        title={t('sectionPoints')}
                        icon={<MapPin size={14} />}
                        action={
                            <input type="checkbox" className={checkboxCls} checked={s.pointsVisible}
                                onChange={(e) => s.patch({ pointsVisible: e.target.checked })} aria-label={t('show')} />
                        }
                    >
                        {s.pointsVisible && (
                            <>
                                <Row label={t('radius', { px: s.pointRadius })}>
                                    <input type="range" className={rangeCls} min={2} max={12} value={s.pointRadius}
                                        onChange={(e) => s.patch({ pointRadius: +e.target.value })} />
                                </Row>
                                <Row label={t('color')}>
                                    <input type="color" className={colorCls} value={s.pointColor}
                                        onChange={(e) => s.patch({ pointColor: e.target.value })} />
                                </Row>
                            </>
                        )}
                        {s.pointsVisible && s.waypoints.length === 0 && (
                            <p className="text-xs text-muted">{t('noWpt')}</p>
                        )}
                    </Section>

                    <Section title={t('sectionExport')} icon={<Download size={14} />}>
                        <Row label={t('exportScale')}>
                            <select
                                className="w-24 rounded-lg border border-line bg-input px-2 py-1.5 text-[13px] text-main outline-none focus:border-sky-400"
                                value={s.exportScale}
                                onChange={(e) => s.patch({ exportScale: +e.target.value })}
                            >
                                <option value={1}>1x</option>
                                <option value={2}>2x</option>
                                <option value={3}>3x</option>
                            </select>
                        </Row>
                        <p className="text-xs leading-relaxed text-muted">{t('exportHint')}</p>
                    </Section>
                    {/* Избранное — доступно только с загруженным треком */}
                    <Section
                        title={t('sectionFavorites')}
                        icon={<Star size={14} />}
                        action={
                            <span className="text-[11px] font-medium text-muted">
                                {s.favorites.length}
                                {s.premium ? '' : ` / ${PRESET_LIMIT}`}
                            </span>
                        }
                    >
                        <button
                            onClick={openSaveFavorite}
                            disabled={alreadyFavorited && !limitReached}
                            title={
                                limitReached
                                    ? t('premiumTitle')
                                    : alreadyFavorited
                                        ? t('alreadySavedTitle')
                                        : t('saveCurrentSettings')
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-input px-3 py-2.5 text-[13px] text-dim transition-colors hover:border-sky-400 hover:text-main disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <BookmarkPlus size={15} />
                            {t('saveCurrentSettings')}
                        </button>

                        <ul className="space-y-1.5">
                            {/* Пресет «По умолчанию» — всегда первый */}
                            <li>
                                <button
                                    onClick={() => s.resetSettings()}
                                    title={t('applyPresetTitle')}
                                    className={`flex w-full items-center gap-1 rounded-lg border py-1 pl-3 pr-3 transition-colors ${isDefault ? 'border-sky-400/70 bg-sky-400/10' : 'border-transparent bg-input hover:border-line'
                                        }`}
                                >
                                    <span
                                        className={`min-w-0 flex-1 truncate text-left text-[13px] ${isDefault ? 'font-medium text-sky-500' : 'text-dim'
                                            }`}
                                    >
                                        {t('presetDefault')}
                                    </span>
                                    {isDefault && <Check size={14} className="shrink-0 text-sky-400" />}
                                </button>
                            </li>

                            {/* Сохранённые пресеты */}
                            {s.favorites.map((f) => {
                                const active = settingsEqual(currentSettings, f.settings);
                                return (
                                    <li key={f.id} className="flex items-center gap-1">
                                        <button
                                            onClick={() => s.applyFavorite(f.id)}
                                            title={t('applyPresetTitle')}
                                            className={`flex min-w-0 flex-1 items-center gap-1 rounded-lg border py-1 pl-3 pr-3 transition-colors ${active ? 'border-sky-400/70 bg-sky-400/10' : 'border-transparent bg-input hover:border-line'
                                                }`}
                                        >
                                            <span
                                                className={`min-w-0 flex-1 truncate text-left text-[13px] ${active ? 'font-medium text-sky-500' : 'text-dim'
                                                    }`}
                                            >
                                                {f.name}
                                            </span>
                                            {active && <Check size={14} className="shrink-0 text-sky-400" />}
                                        </button>
                                        <button
                                            onClick={() => confirmDeleteFavorite(f)}
                                            className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-red-400"
                                            aria-label={`${t('deletePresetTitle')}: ${f.name}`}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        {s.favorites.length === 0 && (
                            <p className="text-xs leading-relaxed text-muted">{t('favoritesHint')}</p>
                        )}
                    </Section>
                    <button
                        onClick={confirmReset}
                        disabled={isDefault}
                        title={isDefault ? t('resetDefaultTitle') : t('resetTitle')}
                        className="my-4 flex w-full items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] text-dim transition-colors hover:border-red-400/60 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <RotateCcw size={14} />
                        {t('resetButton')}
                    </button>
                </>
            )}





            {/* Настройки */}
            <Section title={t('sectionSettings')} icon={<Settings size={14} />}>
                <Row label={t('language')}>
                    <select
                        className="w-32 rounded-lg border border-line bg-input px-2 py-1.5 text-[13px] text-main outline-none focus:border-sky-400"
                        value={s.lang}
                        onChange={(e) => s.patch({ lang: e.target.value as Lang })}
                    >
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                    </select>
                </Row>
                <Row label={t('theme')}>
                    <select
                        className="w-32 rounded-lg border border-line bg-input px-2 py-1.5 text-[13px] text-main outline-none focus:border-sky-400"
                        value={s.theme}
                        onChange={(e) => s.patch({ theme: e.target.value as Theme })}
                    >
                        <option value="dark">{t('themeDark')}</option>
                        <option value="light">{t('themeLight')}</option>
                    </select>
                </Row>
            </Section>

            {/* Обратная связь */}
            <Section title={t('sectionFeedback')} icon={<MessageSquare size={14} />}>
                <button onClick={() => void shareApp()} className={actionBtnCls}>
                    {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
                    {copied ? t('copied') : t('shareApp')}
                </button>
                <button onClick={openFeedbackModal} className={actionBtnCls}>
                    <Mail size={15} />
                    {t('contactDev')}
                </button>
            </Section>

            <footer className="border-t border-line pb-2 pt-3 text-[11px] leading-relaxed text-muted">
                Картографические данные: © участники OpenStreetMap, © CARTO, Tiles © Esri, OpenTopoMap (CC-BY-SA)
            </footer>
        </div>
    );
}