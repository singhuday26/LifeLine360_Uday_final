const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./logger');

// Security headers middleware
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "ws:", "wss:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
});

// CORS configuration
const corsOptions = cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            // Add production domains here
            process.env.FRONTEND_URL
        ].filter(Boolean);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked request from origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs: windowMs, // Time window in milliseconds
        max: max, // Limit each IP to 'max' requests per windowMs
        message: {
            success: false,
            error: {
                message: message,
                retryAfter: Math.ceil(windowMs / 1000)
            }
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        handler: (req, res) => {
            logger.warn('Rate limit exceeded', {
                ip: req.ip,
                url: req.originalUrl,
                method: req.method
            });
            res.status(429).json({
                success: false,
                error: {
                    message: message,
                    retryAfter: Math.ceil(windowMs / 1000)
                }
            });
        }
    });
};

// Different rate limits for different endpoints
const generalRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many requests from this IP, please try again later.'
);

const apiRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    200, // limit each IP to 200 requests per windowMs
    'Too many API requests from this IP, please try again later.'
);

const strictRateLimit = createRateLimit(
    60 * 1000, // 1 minute
    10, // limit each IP to 10 requests per windowMs
    'Too many requests, please slow down.'
);

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Basic XSS prevention - sanitize string inputs
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<[^>]*>/g, '')
                  .trim();
    };

    // Recursively sanitize object properties
    const sanitizeObject = (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return typeof obj === 'string' ? sanitizeString(obj) : obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    };

    // Sanitize request body, query, and params
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);

    next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.info('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Request completed', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });

    next();
};

module.exports = {
    securityHeaders,
    corsOptions,
    generalRateLimit,
    apiRateLimit,
    strictRateLimit,
    sanitizeInput,
    requestLogger
};