const logger = require('../../middleware/logger');
const { extractLocation } = require('../../services/nlp/locationExtract');
const { geocodeIfNeeded } = require('../../services/geo/geocode');
const { sectorize, sectorCentroid } = require('../../utils/sectorIndex');

/**
 * Resolves the best guess for location by combining gazetteer lookups, raw
 * coordinates, and sector indexing. Returns geo metadata for downstream scoring.
 */
async function resolveLocation({ text, entities = [], rawLat, rawLng, fallbackSectorId = null }) {
    try {
        const locationHint = extractLocation(text || '', entities);
        const geo = await geocodeIfNeeded(locationHint, rawLat, rawLng);

        let sectorId = fallbackSectorId;
        if (geo?.lat && geo?.lng) {
            sectorId = sectorize(geo.lat, geo.lng) || sectorId;
        }

        const centroid = geo?.lat && geo?.lng
            ? { lat: geo.lat, lng: geo.lng }
            : (sectorId ? sectorCentroid(sectorId) : null);

        return {
            locationHint,
            geo,
            sectorId,
            centroid,
            confidence: geo?.confidence || locationHint?.confidence || 0.4
        };
    } catch (error) {
        logger.warn('resolveLocation failed, continuing without geo', { error: error.message });
        return {
            locationHint: null,
            geo: null,
            sectorId: fallbackSectorId,
            centroid: fallbackSectorId ? sectorCentroid(fallbackSectorId) : null,
            confidence: 0.2
        };
    }
}

module.exports = {
    resolveLocation
};
