import express from 'express';
import cors from 'cors';
import apiRoutes from './api.js';

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// 🛠️ Configuration CORS — on autorise explicitement ton domaine Hostinger
const allowedOrigins = [
  'https://goldenrod-hamster-349649.hostingersite.com', // ton site en ligne
  'http://localhost:3000' // utile pour tester en local
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // ✅ Autorisé
    } else {
      console.warn(`❌ Origin non autorisée : ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 🧩 Middlewares
app.use(cors(corsOptions)); // Active CORS
app.use(express.json()); // Parse les JSON

// ✅ Route de vérification de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ Tes routes d’API
app.use('/api', apiRoutes);

// 🚀 Démarrage du serveur
app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

