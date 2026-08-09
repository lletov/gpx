import { Route } from 'lucide-react';
import MapView from './components/MapView';
import ControlsPanel from './components/ControlsPanel';
import MobileSheet from './components/MobileSheet';

export default function App() {
    return (
        <div className="flex h-dvh w-full overflow-hidden bg-slate-950 text-slate-100">
            {/* Десктоп: боковая панель */}
            <aside className="hidden w-[340px] shrink-0 flex-col border-r border-slate-800 bg-slate-900 lg:flex">
                <div className="flex items-center gap-2 px-4 pb-2 pt-4">
                    <Route size={18} className="text-sky-400" />
                    <h1 className="text-base font-bold tracking-tight">GPX Visualizer</h1>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                    <ControlsPanel />
                </div>
            </aside>

            {/* Карта на всех экранах */}
            <main className="relative min-h-0 min-w-0 flex-1">
                <MapView />
            </main>

            {/* Мобилка/планшет: нижняя шторка */}
            <MobileSheet />
        </div>
    );
}