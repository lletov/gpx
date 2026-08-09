import { Download, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { exportCurrent } from '../lib/export';

export default function ExportButton({
    label = 'Скачать PNG',
    className = '',
}: {
    label?: string;
    className?: string;
}) {
    const exporting = useStore((s) => s.exporting);
    const hasTrack = useStore((s) => s.track.length > 1);

    return (
        <button
            onClick={() => void exportCurrent()}
            disabled={!hasTrack || exporting}
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-colors hover:bg-sky-400 active:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
        >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {label}
        </button>
    );
}