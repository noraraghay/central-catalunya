import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar rutas y middleware
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware';

// Crear aplicación Express
const app: Application = express();

// Puerto
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parseo de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Central de Catalunya API',
      version: '1.0.0',
      description: 'API REST para gestión del club de fútbol Central de Catalunya',
      documentation: '/api/v1/health',
      endpoints: {
        members: '/api/v1/members',
        teams: '/api/v1/teams',
        fields: '/api/v1/fields',
        bookings: '/api/v1/bookings',
        events: '/api/v1/events',
        payments: '/api/v1/payments',
        products: '/api/v1/products',
        orders: '/api/v1/orders'
      }
    }
  });
});

// Montar rutas API
app.use('/api/v1', routes);

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⚽ CENTRAL DE CATALUNYA API                             ║
║                                                           ║
║   Servidor corriendo en: http://localhost:${PORT}            ║
║   Entorno: ${process.env.NODE_ENV || 'development'}                              ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /                    - Info de la API            ║
║   • GET  /api/v1/health       - Estado del servicio       ║
║   • *    /api/v1/members      - Gestión de socios         ║
║   • *    /api/v1/teams        - Gestión de equipos        ║
║   • *    /api/v1/fields       - Gestión de canchas        ║
║   • *    /api/v1/bookings     - Reservas de canchas       ║
║   • *    /api/v1/events       - Eventos y partidos        ║
║   • *    /api/v1/payments     - Pagos y mensualidades     ║
║   • *    /api/v1/products     - Productos y uniformes     ║
║   • *    /api/v1/orders       - Pedidos                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

export default app;
