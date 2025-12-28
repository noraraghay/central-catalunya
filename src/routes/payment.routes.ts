import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const controller = new PaymentController();

// CRUD básico
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/pending', controller.getPending);
router.get('/overdue', controller.getOverdue);
router.get('/statistics', controller.getStatistics);
router.get('/monthly-revenue', controller.getMonthlyRevenue);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Mensualidades
router.post('/monthly-fee', controller.createMonthlyFee);
router.post('/generate-monthly-fees', controller.generateMonthlyFees);
router.get('/monthly-fees/:year/:month', controller.getMonthlyFeesByPeriod);

// Acciones
router.patch('/:id/pay', controller.registerPayment);
router.patch('/:id/cancel', controller.cancel);
router.post('/mark-overdue', controller.markOverdue);

// Historial de miembros
router.get('/member/:memberId/history', controller.getMemberHistory);
router.get('/member/:memberId/pending-fees', controller.getMemberPendingFees);

export default router;
