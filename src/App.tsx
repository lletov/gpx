import MapView from './components/MapView';
import Sidebar from './components/Sidebar';

export default function App() {
    return (
        <div className="app">
            <Sidebar />
            <MapView />
        </div>
    );
}