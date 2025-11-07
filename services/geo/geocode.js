const logger = require('../../middleware/logger');

const NOMINATIM_BASE = process.env.NOMINATIM_BASE || 'https://nominatim.openstreetmap.org';
const cache = new Map();

async function getFetch() {
    if (typeof fetch === 'function') {
        return fetch;
    }
    const { default: nodeFetch } = await import('node-fetch');
    return nodeFetch;
}

async function geocodeIfNeeded(location, rawLat, rawLng) {
    if (typeof rawLat === 'number' && typeof rawLng === 'number') {
        return {
            lat: rawLat,
            lng: rawLng,
            confidence: 0.9,
            resolvedFrom: 'source'
        };
    }

    if (!location || !location.name) {
        return null;
    }

    const cacheKey = location.name.trim().toLowerCase();
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        const fetcher = await getFetch();
        const url = new URL('/search', NOMINATIM_BASE);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '1');
        url.searchParams.set('q', location.name);

        const response = await fetcher(url.toString(), {
            headers: {
                'User-Agent': 'LifeLine360-NLP/1.0 (contact@lifeline360.local)'
            }
        });

        if (!response.ok) {
            throw new Error(`Geocode failed with status ${response.status}`);
        }

        const [first] = await response.json();
        if (!first) {
            return null;
        }

        const result = {
            lat: Number(first.lat),
            lng: Number(first.lon),
            confidence: location.confidence || 0.6,
            name: location.name,
            resolvedFrom: 'geocode'
        };

        cache.set(cacheKey, result);
        return result;
    } catch (error) {
        logger.warn('Geocode lookup failed', { error: error.message, location: location.name });
        return null;
    }
}

module.exports = {
    geocodeIfNeeded
};
