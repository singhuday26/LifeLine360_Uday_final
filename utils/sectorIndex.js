const GEOHASH_PRECISION = 0.25; // roughly ~25km² grid depending on latitude

function toSector(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return null;
    }

    const latBucket = Math.floor(lat / GEOHASH_PRECISION);
    const lngBucket = Math.floor(lng / GEOHASH_PRECISION);
    return `SEC_${latBucket}_${lngBucket}`;
}

function sectorCentroid(sectorId) {
    if (typeof sectorId !== 'string' || !sectorId.startsWith('SEC_')) {
        return null;
    }

    const [, latBucketStr, lngBucketStr] = sectorId.split('_');
    const latBucket = Number(latBucketStr);
    const lngBucket = Number(lngBucketStr);

    if (Number.isNaN(latBucket) || Number.isNaN(lngBucket)) {
        return null;
    }

    const lat = (latBucket + 0.5) * GEOHASH_PRECISION;
    const lng = (lngBucket + 0.5) * GEOHASH_PRECISION;
    return { lat, lng };
}

module.exports = {
    sectorize: toSector,
    sectorCentroid,
    GEOHASH_PRECISION
};
