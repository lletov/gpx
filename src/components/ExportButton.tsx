import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { renderImage, downloadImage } from '../lib/export';
import { TILE_PROVIDERS } from '../lib/tiles';
import { useT } from '../lib/i18n';

export default function ExportButton({
    label,
    className = '',
}: {
    label?: string;
    className?: string;
}) {
    const t = useT();
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
                title: t('exportReady'),
                icon: <ImageIcon size={16} className="text-sky-400" />,
                content: (
                    <div>
                        <div className="rounded-lg border border-line bg-[repeating-conic-gradient(#334155_0%_25%,#1e293b_0%_50%)] p-2 [background-size:16px_16px]">
                            <img src={img.dataUrl} alt={t('exportPreviewAlt')} className="mx-auto max-h-60 max-w-full object-contain" />
                        </div>
                        <p className="mt-3 text-xs text-muted">
                            {t('exportResolution', { w: img.width, h: img.height })}
                            {st.mapVisible ? '' : t('exportTransparent')}
                        </p>
                    </div>
                ),
                confirmText: t('download'),
                cancelText: t('cancel'),
                onConfirm: () => downloadImage(img.dataUrl, img.fileName),
            });
        } catch (e) {
            useStore.getState().openModal({
                title: t('exportErrorTitle'),
                content: <p className="whitespace-pre-line">{t('exportError', { error: (e as Error).message })}</p>,
                confirmText: t('ok'),
            });
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
            {label ?? t('exportButton')}
        </button>
    );
}