import { useState, useRef, useEffect } from 'react';
import './ApiLocation.css';
import { useCart } from '../context/CartContext';

interface LocationState {
    display: string;
    lat: number | null;
    lon: number | null;
}

const ApiLocation = () => {
    const { setLocationAddress } = useCart();
    const [popupOpen, setPopupOpen] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [location, setLocation] = useState<LocationState>({ display: '', lat: null, lon: null });
    const [autoStatus, setAutoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [autoMessage, setAutoMessage] = useState('');
    const popupRef = useRef<HTMLDivElement>(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setPopupOpen(false);
            }
        };
        if (popupOpen) document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [popupOpen]);

    const handleAddLocation = async () => {
        if (!manualInput.trim()) return;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualInput)}&format=json&limit=1`
            );
            const data = await res.json();
            if (data && data.length > 0) {
                const display = data[0].display_name;
                setLocation({ display, lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
                setLocationAddress(display);
            } else {
                setLocation({ display: manualInput, lat: null, lon: null });
                setLocationAddress(manualInput);
            }
        } catch {
            setLocation({ display: manualInput, lat: null, lon: null });
            setLocationAddress(manualInput);
        }
        setManualInput('');
        setPopupOpen(false);
    };

    const handleAutoLocation = () => {
        if (!navigator.geolocation) {
            setAutoMessage('Geolocation is not supported by your browser.');
            setAutoStatus('error');
            return;
        }
        setAutoStatus('loading');
        setAutoMessage('Detecting your location…');

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                    );
                    const data = await res.json();
                    const display = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                    setLocation({ display, lat, lon });
                    setLocationAddress(display);
                    setAutoStatus('success');
                    setAutoMessage('');
                    setPopupOpen(false);
                } catch {
                    const display = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                    setLocation({ display, lat, lon });
                    setLocationAddress(display);
                    setAutoStatus('success');
                    setAutoMessage('');
                    setPopupOpen(false);
                }
            },
            (err) => {
                console.warn('Geolocation error:', err);
                setAutoStatus('error');
                setAutoMessage('Location permission denied or unavailable.');
            }
        );
    };

    return (
        <div className="api-location-wrapper">
            {/* Trigger button shown in Navbar */}
            <button
                className="api-location-btn"
                onClick={() => setPopupOpen((prev) => !prev)}
                title="Search your location"
            >
                <span className="api-location-icon">📍</span>
                <span className="api-location-label">
                    {location.display
                        ? location.display.length > 25
                            ? location.display.slice(0, 25) + '…'
                            : location.display
                        : 'Search your location'}
                </span>
            </button>

            {/* Popup */}
            {popupOpen && (
                <div className="api-location-popup" ref={popupRef}>
                    <div className="api-location-popup-header">
                        <h3>Choose Location</h3>
                        <button className="api-location-close" onClick={() => setPopupOpen(false)}>✕</button>
                    </div>

                    {/* Option 1: Add Location manually */}
                    <div className="api-location-option">
                        <div className="api-location-option-title">
                            <span className="option-icon">🗺️</span>
                            Add Location
                        </div>
                        <div className="api-location-input-row">
                            <input
                                type="text"
                                className="api-location-input"
                                placeholder="Enter city, area or address…"
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                            />
                            <button
                                className="api-location-confirm-btn"
                                onClick={handleAddLocation}
                                disabled={!manualInput.trim()}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>

                    <div className="api-location-divider">OR</div>

                    {/* Option 2: Choose Automatically */}
                    <div className="api-location-option">
                        <div className="api-location-option-title">
                            <span className="option-icon">🎯</span>
                            Choose Automatically
                        </div>
                        <button
                            className="api-location-auto-btn"
                            onClick={handleAutoLocation}
                            disabled={autoStatus === 'loading'}
                        >
                            {autoStatus === 'loading' ? (
                                <span className="api-location-spinner" />
                            ) : (
                                '📡 Detect My Location'
                            )}
                        </button>
                        {autoMessage && (
                            <p className={`api-location-status ${autoStatus === 'error' ? 'error' : 'info'}`}>
                                {autoMessage}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiLocation;
