import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const controller = new ProductController();

// CRUD básico
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/uniforms', controller.getUniforms);
router.get('/training-kits', controller.getTrainingKits);
router.get('/search', controller.search);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Gestión de stock
router.patch('/:id/stock', controller.updateStock);
router.get('/:id/availability', controller.checkAvailability);
router.patch('/:id/activate', controller.activate);
router.patch('/:id/deactivate', controller.deactivate);

export default router;
