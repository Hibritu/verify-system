require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { init } = require('./dbInit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { performance } = require('perf_hooks');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
}));
app.options(/^\/api\/.*$/, cors());
app.use(express.json({ limit: '5mb' }));

// --- Logger ---
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} in ${ms}ms`);
  });
  next();
});

// --- PostgreSQL init ---
init()
  .then(() => console.log('✅ PostgreSQL ready'))
  .catch((err) => {
    console.error('❌ PostgreSQL init failed', err);
  });

// --- Swagger setup ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Exam Result Verification API",
      version: "1.0.0",
      description: "API for exam results and certificate issuance"
    },
    servers: [
      { url: process.env.BASE_URL || `http://localhost:${PORT}` },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fingerprint', require('./routes/fingerprint'));
app.use('/api/results', require('./routes/results'));
app.use('/api/certificates', require('./routes/certificates'));

// --- Root redirect to Swagger Docs ---
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});
// --- Health check for Render ---
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📘 Swagger Docs: ${process.env.BASE_URL || `http://localhost:${PORT}`}/api-docs`);
});
