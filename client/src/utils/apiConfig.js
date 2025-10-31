const DEFAULT_API_PORT = 3001;

const buildFromWindow = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const host = window.location.hostname;
    return `${protocol}://${host}:${DEFAULT_API_PORT}`;
};

export const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    const fallback = buildFromWindow();
    return fallback || `http://localhost:${DEFAULT_API_PORT}`;
};

export const getWebSocketUrl = () => {
    if (import.meta.env.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL;
    }

    const apiBase = getApiBaseUrl();
    const withoutProtocol = apiBase.replace(/^https?:\/\//i, '');
    const secure = apiBase.startsWith('https://');
    const scheme = secure ? 'wss' : 'ws';
    return `${scheme}://${withoutProtocol}`;
};
