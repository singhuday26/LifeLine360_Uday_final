const gazetteer = [
    { name: 'vijayawada', lat: 16.5062, lng: 80.6480 },
    { name: 'amaravati', lat: 16.5736, lng: 80.3529 },
    { name: 'tenali', lat: 16.2379, lng: 80.6403 },
    { name: 'guntur', lat: 16.3067, lng: 80.4365 }
];

function extractLocation(text, entities = []) {
    if (!text) {
        return null;
    }

    const lower = text.toLowerCase();

    for (const place of gazetteer) {
        if (lower.includes(place.name)) {
            return {
                name: place.name,
                lat: place.lat,
                lng: place.lng,
                confidence: 0.8,
                resolvedFrom: 'gazetteer'
            };
        }
    }

    const locationEntity = entities.find(entity => entity.type === 'LOCATION');
    if (locationEntity) {
        return {
            name: locationEntity.value,
            confidence: Math.min(0.6, locationEntity.confidence || 0.3),
            resolvedFrom: 'text'
        };
    }

    const nearMatch = /near\s+([a-z\s]+)/i.exec(text);
    if (nearMatch) {
        const name = nearMatch[1].trim();
        return {
            name,
            confidence: 0.5,
            resolvedFrom: 'pattern'
        };
    }

    return null;
}

module.exports = {
    extractLocation
};
