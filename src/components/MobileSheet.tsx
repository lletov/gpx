import { useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store';
import { trackDistanceMeters } from '../lib/utils';
import ControlsPanel from './ControlsPanel';
import ExportButton from './ExportButton';

// Должно совпадать с translate-y-[calc(100%-84px)] ниже —
// это высота свёрнутой шторки, которая остаётся видимой
const HEADER_H = 84;
// Скорость «флика», px/ms: свайп быстрее порога решает исход независимо от позиции
const VELOCITY_THRESHOLD = 0.5;
// Сдвиг пальца, после которого жест считается перетаскиванием, а не тапом
const DRAG_SLOP = 6;

export default function MobileSheet() {
    const open = useStore((s) => s.sheetOpen);
    const patch = useStore((s) => s.patch);
    const trackName = useStore((s) => s.trackName);
    const fileName = useStore((s) => s.fileName);
    const track = useStore((s) => s.track);

    const sheetRef = useRef<HTMLDivElement>(null);
    const didDrag = useRef(false);
    const drag = useRef({
        active: false,
        startY: 0,
        startOffset: 0,
        offset: 0,
        lastY: 0,
        lastTime: 0,
        velocity: 0,
    });

    const title = trackName ?? fileName ?? 'GPX Visualizer';
    const subtitle = track.length
        ? `${track.length} точек · ${(trackDistanceMeters(track) / 1000).toFixed(1)} км`
        : 'Загрузите GPX-файл';

    const toggle = () => patch({ sheetOpen: !open });

    const closedOffset = () => Math.max(0, (sheetRef.current?.offsetHeight ?? 0) - HEADER_H);

    const onDragMove = useCallback((e: PointerEvent) => {
        const st = drag.current;
        if (!st.active) return;
        e.preventDefault();

        const closed = closedOffset();
        st.offset = Math.min(closed, Math.max(0, st.startOffset + (e.clientY - st.startY)));
        if (Math.abs(e.clientY - st.startY) > DRAG_SLOP) didDrag.current = true;

        // скорость со сглаживанием (px/ms, положительная — вниз)
        const now = performance.now();
        const dt = now - st.lastTime;
        if (dt > 0) {
            const v = (e.clientY - st.lastY) / dt;
            st.velocity = 0.8 * v + 0.2 * st.velocity;
            st.lastY = e.clientY;
            st.lastTime = now;
        }

        const el = sheetRef.current;
        if (el) {
            el.style.transition = 'none';
            el.style.transform = `translateY(${st.offset}px)`;
        }
    }, []);

    const onDragEnd = useCallback(() => {
        const st = drag.current;
        if (!st.active) return;
        st.active = false;
        window.removeEventListener('pointermove', onDragMove);
        window.removeEventListener('pointerup', onDragEnd);
        window.removeEventListener('pointercancel', onDragEnd);

        // Возвращаем управление классам: transform + transition снова из Tailwind,
        // браузер сам доанимирует от точки отпускания до целевого положения
        const el = sheetRef.current;
        if (el) {
            el.style.transition = '';
            el.style.transform = '';
        }

        const closed = closedOffset();
        let nextOpen: boolean;
        if (Math.abs(st.velocity) > VELOCITY_THRESHOLD) {
            nextOpen = st.velocity < 0; // свайп вверх — открыть, вниз — закрыть
        } else {
            nextOpen = st.offset < closed / 2;
        }
        patch({ sheetOpen: nextOpen });
    }, [onDragMove, patch]);

    const onDragStart = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const st = drag.current;
        st.active = true;
        st.startY = e.clientY;
        st.startOffset = open ? 0 : closedOffset();
        st.offset = st.startOffset;
        st.lastY = e.clientY;
        st.lastTime = performance.now();
        st.velocity = 0;
        didDrag.current = false;
        window.addEventListener('pointermove', onDragMove);
        window.addEventListener('pointerup', onDragEnd);
        window.addEventListener('pointercancel', onDragEnd);
    };

    return (
        <div
            ref={sheetRef}
            className={`fixed inset-x-0 bottom-0 z-[1001] flex h-[78dvh] max-h-[640px] flex-col rounded-t-2xl bg-slate-900 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out lg:hidden ${open ? 'translate-y-0' : 'translate-y-[calc(100%-84px)]'
                }`}
        >
            {/* Шапка: зона перетаскивания. Видна всегда, в свёрнутом состоянии — только она */}
            <div
                onPointerDown={onDragStart}
                onClickCapture={(e) => {
                    // если это был свайп, не даём клику дойти до кнопок шапки
                    if (didDrag.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        didDrag.current = false;
                    }
                }}
                className="shrink-0 cursor-grab touch-none select-none border-b border-slate-800 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 active:cursor-grabbing"
            >
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-600" aria-hidden />
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggle}
                        className="min-w-0 flex-1 text-left"
                        aria-label={open ? 'Свернуть панель' : 'Развернуть панель'}
                    >
                        <span className="block truncate text-sm font-semibold text-slate-100">{title}</span>
                        <span className="block truncate text-xs text-slate-400">{subtitle}</span>
                    </button>
                    <ExportButton className="shrink-0" />
                    <button
                        onClick={toggle}
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                        aria-label={open ? 'Свернуть' : 'Развернуть'}
                    >
                        {open ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                </div>
            </div>

            {/* Контент */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2">
                <ControlsPanel />
            </div>
        </div>
    );
}