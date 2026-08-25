import { useStore } from '../store';

export default function Toast() {
    const toast = useStore((s) => s.toast);
    if (!toast) return null;
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[3000] flex justify-center px-4 lg:bottom-8">
            <div className="max-w-full truncate rounded-full bg-main px-4 py-2 text-sm font-medium text-panel shadow-xl animate-[modal-in_0.18s_ease-out]">
                {toast}
            </div>
        </div>
    );
}