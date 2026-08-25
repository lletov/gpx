import { useLayoutEffect } from 'react';
import { Route } from 'lucide-react';
import MapView from './components/MapView';
import ControlsPanel from './components/ControlsPanel';
import MobileSheet from './components/MobileSheet';
import Toast from './components/Toast';
import { ModalHost } from './components/Modal';
import { useStore } from './store';

export default function App() {
    const theme = useStore((s) => s.theme);

    // Класс на <html> переключает палитру токенов
    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-app text-main">
            <aside className="hidden w-[340px] shrink-0 flex-col border-r border-line bg-panel lg:flex">
                <div className="flex items-center gap-2 px-4 pb-2 pt-4">
                    <Route size={18} className="text-sky-500" />
                    <h1 className="text-base font-bold tracking-tight">GPX Visualizer</h1>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                    <ControlsPanel />
                </div>
            </aside>

            <main className="relative min-h-0 min-w-0 flex-1">
                <MapView />
            </main>

            <MobileSheet />
            <ModalHost />
            <Toast />
        </div>
    );
}