import { Router } from 'express';
import { FieldController } from '../controllers/field.controller';

const router = Router();
const controller = new FieldController();

// CRUD básico
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/usage-stats', controller.getUsageStats);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Disponibilidad y precios
router.get('/:id/availability', controller.checkAvailability);
router.get('/:id/available-slots', controller.getAvailableSlots);
router.get('/:id/calculate-price', controller.calculatePrice);
router.patch('/:id/status', controller.changeStatus);

export default router;
