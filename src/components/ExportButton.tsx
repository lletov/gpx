import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { renderImage, downloadImage } from '../lib/export';
import { TILE_PROVIDERS } from '../lib/tiles';

export default function ExportButton({
    label = 'Сохранить изображение',
    className = '',
}: {
    label?: string;
    className?: string;
}) {
    const exporting = useStore((s) => s.exporting);
    const hasTrack = useStore((s) => s.track.length > 1);

    const handleExport = async () => {
        const st = useStore.getState();
        const map = st.mapInstance;
        if (!map || st.track.length < 2 || st.exporting) return;

        const provider = TILE_PROVIDERS.find((p) => p.id === st.providerId) ?? TILE_PROVIDERS[0];
        st.patch({ exporting: true });
        try {
            const img = await renderImage(map, st, provider.url, provider.attribution);
            useStore.getState().openModal({
                title: 'Изображение готово',
                icon: <ImageIcon size={16} className="text-sky-400" />,
                content: (
                    <div>
                        {/* тёмная «шахматка», чтобы был виден прозрачный фон */}
                        <div className="rounded-lg border border-slate-700 bg-[repeating-conic-gradient(#334155_0%_25%,#1e293b_0%_50%)] p-2 [background-size:16px_16px]">
                            <img src={img.dataUrl} alt="Превью трека" className="mx-auto max-h-60 max-w-full object-contain" />
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                            Разрешение {img.width}×{img.height}px · PNG
                            {st.mapVisible ? '' : ' с прозрачным фоном'}
                        </p>
                    </div>
                ),
                confirmText: 'Скачать',
                cancelText: 'Отмена',
                onConfirm: () => downloadImage(img.dataUrl, img.fileName),
            });
        } catch (e) {
            alert(
                'Не удалось экспортировать: ' +
                (e as Error).message +
                '\n\nЧастая причина — тайлы подложки не отдают CORS-заголовок. Попробуйте другого провайдера или отключите подложку.'
            );
        } finally {
            useStore.getState().patch({ exporting: false });
        }
    };

    return (
        <button
            onClick={() => void handleExport()}
            disabled={!hasTrack || exporting}
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-colors hover:bg-sky-400 active:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
        >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {label}
        </button>
    );
}