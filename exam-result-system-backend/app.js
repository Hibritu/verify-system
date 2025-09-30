require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { performance } = require('perf_hooks');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
}));
// Explicitly respond to preflight for API routes (Express 5 safe pattern)
app.options(/^\/api\/.*$/, cors());
// Express 5 + path-to-regexp v6 does not support '*' route patterns.
// Global CORS middleware above already handles OPTIONS/preflight.
app.use(express.json({ limit: '5mb' }));

// Logger
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} in ${ms}ms`);
  });
  next();
});

// --- MongoDB connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// --- Swagger setup ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Exam Result Verification API",
      version: "1.0.0",
      description: "API for exam results and certificate issuance"
    },
    servers: [{ url: `http://localhost:${PORT}` }], // 
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'], // make sure your route files exist
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fingerprint', require('./routes/fingerprint'));
app.use('/api/results', require('./routes/results'));
app.use('/api/certificates', require('./routes/certificates'));

// --- Start server ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
