import { Router } from 'express';
import { OrderController } from '../controllers/product.controller';

const router = Router();
const controller = new OrderController();

// CRUD básico
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/pending', controller.getPending);
router.get('/ready', controller.getReady);
router.get('/statistics', controller.getStatistics);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Acciones de estado
router.patch('/:id/confirm', controller.confirm);
router.patch('/:id/preparing', controller.markPreparing);
router.patch('/:id/ready', controller.markReady);
router.patch('/:id/deliver', controller.markDelivered);
router.patch('/:id/cancel', controller.cancel);
router.patch('/:id/discount', controller.applyDiscount);

export default router;
