import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { AlertTriangle, MapPin, Zap, Activity } from 'lucide-react';

// Google Maps API Key from environment
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Map Container Component
function GoogleMap({ center, zoom, onMapClick, className }) {
    const ref = useRef();
    const [map, setMap] = useState();

    useEffect(() => {
        if (ref.current && !map) {
            const newMap = new window.google.maps.Map(ref.current, {
                center,
                zoom,
                styles: [
                    {
                        featureType: 'all',
                        elementType: 'labels.text.fill',
                        stylers: [{ color: '#ffffff' }]
                    },
                    {
                        featureType: 'all',
                        elementType: 'labels.text.stroke',
                        stylers: [{ color: '#000000' }, { lightness: 13 }]
                    },
                    {
                        featureType: 'administrative',
                        elementType: 'geometry.fill',
                        stylers: [{ color: '#000000' }]
                    },
                    {
                        featureType: 'administrative',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#144b53' }, { lightness: 14 }, { weight: 1.4 }]
                    },
                    {
                        featureType: 'landscape',
                        elementType: 'all',
                        stylers: [{ color: '#08304b' }]
                    },
                    {
                        featureType: 'poi',
                        elementType: 'geometry',
                        stylers: [{ color: '#0c4152' }, { lightness: 5 }]
                    },
                    {
                        featureType: 'road.highway',
                        elementType: 'geometry.fill',
                        stylers: [{ color: '#000000' }]
                    },
                    {
                        featureType: 'road.highway',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#0b434f' }, { lightness: 25 }]
                    },
                    {
                        featureType: 'road.arterial',
                        elementType: 'geometry.fill',
                        stylers: [{ color: '#000000' }]
                    },
                    {
                        featureType: 'road.arterial',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#0b3d51' }, { lightness: 16 }]
                    },
                    {
                        featureType: 'road.local',
                        elementType: 'geometry',
                        stylers: [{ color: '#000000' }]
                    },
                    {
                        featureType: 'transit',
                        elementType: 'all',
                        stylers: [{ color: '#146474' }]
                    },
                    {
                        featureType: 'water',
                        elementType: 'all',
                        stylers: [{ color: '#021019' }]
                    }
                ],
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                scaleControl: true,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: true,
                gestureHandling: 'cooperative'
            });

            // Add click listener
            if (onMapClick) {
                newMap.addListener('click', (event) => {
                    onMapClick({
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    });
                });
            }

            setMap(newMap);
        }
    }, [ref, map, center, zoom, onMapClick]);

    // Update map center when center prop changes
    useEffect(() => {
        if (map && center) {
            map.setCenter(center);
        }
    }, [map, center]);

    // Update map zoom when zoom prop changes
    useEffect(() => {
        if (map && zoom) {
            map.setZoom(zoom);
        }
    }, [map, zoom]);

    return (
        <div ref={ref} className={className} />
    );
}

// Hotspot Marker Component
function HotspotMarker({ hotspot, map }) {
    const [marker, setMarker] = useState();

    const getMarkerIcon = (severity, type) => {
        const size = 40;
        const color = severity === 'critical' ? '#ef4444' :
                     severity === 'high' ? '#f97316' :
                     severity === 'medium' ? '#eab308' : '#22c55e';

        // Create SVG icon
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="6" fill="white" opacity="0.8"/>
                <text x="12" y="16" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">
                    ${type === 'fire' ? 'F' : type === 'flood' ? 'W' : type === 'earthquake' ? 'Q' : type === 'air_quality' ? 'A' : '!'}
                </text>
            </svg>
        `;

        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            scaledSize: new window.google.maps.Size(size, size),
            anchor: new window.google.maps.Point(size/2, size/2)
        };
    };

    useEffect(() => {
        if (!map || !hotspot) return;

        const markerIcon = getMarkerIcon(hotspot.severity, hotspot.type);

        const newMarker = new window.google.maps.Marker({
            position: {
                lat: hotspot.location.lat,
                lng: hotspot.location.lng
            },
            map,
            icon: markerIcon,
            title: `${hotspot.type.toUpperCase()} - ${hotspot.severity.toUpperCase()}`,
            animation: window.google.maps.Animation.DROP
        });

        // Create info window
        const infoContent = `
            <div class="p-3 max-w-xs">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 rounded-full ${
                        hotspot.severity === 'critical' ? 'bg-red-500' :
                        hotspot.severity === 'high' ? 'bg-orange-500' :
                        hotspot.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }"></div>
                    <span class="font-bold text-gray-800 capitalize">${hotspot.type}</span>
                    <span class="text-sm text-gray-600">(${hotspot.severity})</span>
                </div>
                <p class="text-sm text-gray-700 mb-2">${hotspot.description}</p>
                <div class="text-xs text-gray-500">
                    <div>📍 ${hotspot.location.address}</div>
                    <div>🕒 ${new Date(hotspot.timestamp).toLocaleString()}</div>
                    <div>📊 Sensors: ${hotspot.sensors?.join(', ') || 'Unknown'}</div>
                    <div>📋 Status: ${hotspot.status}</div>
                </div>
            </div>
        `;

        const newInfoWindow = new window.google.maps.InfoWindow({
            content: infoContent
        });

        // Add click listener to marker
        newMarker.addListener('click', () => {
            // Close other info windows
            if (window.currentInfoWindow) {
                window.currentInfoWindow.close();
            }
            newInfoWindow.open(map, newMarker);
            window.currentInfoWindow = newInfoWindow;
        });

        setMarker(newMarker);

        return () => {
            if (newMarker) {
                newMarker.setMap(null);
            }
            if (newInfoWindow) {
                newInfoWindow.close();
            }
        };
    }, [map, hotspot]);

    // Update marker animation for new hotspots
    useEffect(() => {
        if (marker && hotspot && Date.now() - new Date(hotspot.timestamp).getTime() < 30000) {
            // New hotspot (less than 30 seconds old) - add bounce animation
            marker.setAnimation(window.google.maps.Animation.BOUNCE);
            setTimeout(() => {
                marker.setAnimation(null);
            }, 2000);
        }
    }, [marker, hotspot]);

    return null;
}

// Map Component with Error Handling
function MapComponent({ center, zoom, hotspots, onMapClick, className }) {
    const render = useCallback((status) => {
        switch (status) {
            case Status.LOADING:
                return (
                    <div className="flex items-center justify-center h-full bg-slate-900">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                            <p className="text-cyan-400 font-medium">Loading Google Maps...</p>
                        </div>
                    </div>
                );
            case Status.FAILURE:
                return (
                    <div className="flex items-center justify-center h-full bg-slate-900">
                        <div className="text-center p-6">
                            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Map Loading Failed</h3>
                            <p className="text-gray-400 mb-4">
                                Please check your Google Maps API key configuration.
                            </p>
                            <div className="text-sm text-gray-500 bg-gray-800 p-3 rounded">
                                <p><strong>Setup Instructions:</strong></p>
                                <ol className="text-left mt-2 space-y-1">
                                    <li>1. Get a Google Maps API key from <a href="https://console.cloud.google.com/google/maps-apis" className="text-cyan-400 underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                                    <li>2. Enable Maps JavaScript API</li>
                                    <li>3. Add your API key to <code className="bg-gray-700 px-1 rounded">.env</code> as <code className="bg-gray-700 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code></li>
                                    <li>4. Restart the development server</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                );
            case Status.SUCCESS:
                return (
                    <GoogleMap
                        center={center}
                        zoom={zoom}
                        hotspots={hotspots}
                        onMapClick={onMapClick}
                        className={className}
                    />
                );
        }
    }, [center, zoom, hotspots, onMapClick, className]);

    return (
        <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render}>
            <GoogleMap
                center={center}
                zoom={zoom}
                hotspots={hotspots}
                onMapClick={onMapClick}
                className={className}
            />
        </Wrapper>
    );
}

// Main Google Maps Component with Hotspots
export default function GoogleMapsHotspotMap({ hotspots = [], isConnected = false, className = "h-full w-full" }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India
    const [mapZoom, setMapZoom] = useState(5);

    // Auto-center map on hotspots
    useEffect(() => {
        if (hotspots.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            hotspots.forEach(hotspot => {
                bounds.extend({
                    lat: hotspot.location.lat,
                    lng: hotspot.location.lng
                });
            });

            // Fit bounds if we have a map instance (this would need to be passed down)
            // For now, center on the first hotspot
            setMapCenter({
                lat: hotspots[0].location.lat,
                lng: hotspots[0].location.lng
            });
            setMapZoom(8);
        }
    }, [hotspots]);

    const handleMapClick = useCallback((location) => {
        setSelectedLocation(location);
        console.log('Map clicked at:', location);
    }, []);

    return (
        <div className={`relative ${className}`}>
            {/* Map Container */}
            <MapComponent
                center={mapCenter}
                zoom={mapZoom}
                hotspots={hotspots}
                onMapClick={handleMapClick}
                className="h-full w-full rounded-2xl"
            />

            {/* Hotspot Markers (rendered by MapComponent) */}
            {hotspots.map((hotspot) => (
                <HotspotMarker
                    key={hotspot.id}
                    hotspot={hotspot}
                    map={null} // This will be set by the MapComponent
                />
            ))}

            {/* Connection Status Overlay */}
            <div className="absolute top-4 left-4 z-10">
                <div className={`px-4 py-2 rounded-full text-sm font-bold border backdrop-blur-md shadow-lg ${
                    isConnected
                        ? 'bg-green-500/20 text-green-300 border-green-400/50 shadow-green-500/25'
                        : 'bg-red-500/20 text-red-300 border-red-400/50 shadow-red-500/25'
                }`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                        {isConnected ? 'LIVE INCIDENT MAP' : 'MAP OFFLINE'}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/10">
                <h4 className="text-white font-bold mb-3 text-sm">INCIDENT LEGEND</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                        <span className="text-white text-xs">Critical Alert</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
                        <span className="text-white text-xs">High Priority</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
                        <span className="text-white text-xs">Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                        <span className="text-white text-xs">Low Priority</span>
                    </div>
                </div>
            </div>

            {/* Statistics Overlay */}
            <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/10">
                <div className="text-center">
                    <div className="text-2xl font-black text-white mb-1">{hotspots.length}</div>
                    <div className="text-xs text-gray-300 font-medium">ACTIVE INCIDENTS</div>
                    <div className="text-xs text-cyan-400 mt-1">
                        {hotspots.filter(h => h.severity === 'critical').length} Critical
                    </div>
                </div>
            </div>

            {/* Selected Location Indicator */}
            {selectedLocation && (
                <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/10">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="text-white text-xs">
                            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}