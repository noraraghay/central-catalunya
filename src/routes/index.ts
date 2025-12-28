import { Router } from 'express';
import memberRoutes from './member.routes';
import teamRoutes from './team.routes';
import fieldRoutes from './field.routes';
import bookingRoutes from './booking.routes';
import eventRoutes from './event.routes';
import paymentRoutes from './payment.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';

const router = Router();

// Montar rutas
router.use('/members', memberRoutes);
router.use('/teams', teamRoutes);
router.use('/fields', fieldRoutes);
router.use('/bookings', bookingRoutes);
router.use('/events', eventRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// Ruta de salud
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Central de Catalunya API',
      version: '1.0.0'
    }
  });
});

export default router;
