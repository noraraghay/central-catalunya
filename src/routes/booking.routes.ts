import { Router } from 'express';
import { BookingController } from '../controllers/field.controller';

const router = Router();
const controller = new BookingController();

// CRUD básico
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/today', controller.getToday);
router.get('/upcoming', controller.getUpcoming);
router.get('/statistics', controller.getStatistics);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Acciones de estado
router.patch('/:id/confirm', controller.confirm);
router.patch('/:id/cancel', controller.cancel);
router.patch('/:id/complete', controller.complete);
router.patch('/:id/pay', controller.markAsPaid);

export default router;
