import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useStore } from '../store';

export interface ModalProps {
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    confirmText: string;
    cancelText?: string; // если не передать — будет одна кнопка
    confirmVariant?: 'primary' | 'danger';
    onConfirm?: () => void;
    onCancel?: () => void;
}

export function Modal({
    title,
    icon,
    children,
    confirmText,
    cancelText,
    confirmVariant = 'primary',
    onConfirm,
    onCancel,
}: ModalProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70" onClick={onCancel} aria-hidden />
            <div
                role="dialog"
                aria-modal="true"
                className="relative flex max-h-[85dvh] w-full max-w-md flex-col rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl animate-[modal-in_0.18s_ease-out]"
            >
                {title && (
                    <div className="mb-3 flex items-center gap-2">
                        {icon}
                        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
                    </div>
                )}
                <div className="min-h-0 overflow-y-auto text-sm leading-relaxed text-slate-300">{children}</div>
                <div className="mt-5 flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end">
                    {cancelText && (
                        <button
                            onClick={onCancel}
                            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${confirmVariant === 'danger'
                                ? 'bg-red-500 hover:bg-red-400'
                                : 'bg-sky-500 hover:bg-sky-400'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Единственная точка рендера: одновременно может быть не больше одной модалки */
export function ModalHost() {
    const modal = useStore((s) => s.modal);
    const closeModal = useStore((s) => s.closeModal);

    if (!modal) return null;

    return (
        <Modal
            title={modal.title}
            icon={modal.icon}
            confirmText={modal.confirmText}
            cancelText={modal.cancelText}
            confirmVariant={modal.confirmVariant}
            onConfirm={() => {
                modal.onConfirm?.();
                closeModal();
            }}
            onCancel={() => {
                modal.onCancel?.();
                closeModal();
            }}
        >
            {modal.content}
        </Modal>
    );
}