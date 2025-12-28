import { Router } from 'express';
import { EventController } from '../controllers/event.controller';

const router = Router();
const controller = new EventController();

// CRUD básico
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/upcoming', controller.getUpcoming);
router.get('/today', controller.getToday);
router.get('/this-week', controller.getThisWeek);
router.get('/matches', controller.getMatches);
router.get('/statistics', controller.getStatistics);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Gestión de participantes
router.post('/:id/participants/:memberId', controller.registerParticipant);
router.delete('/:id/participants/:memberId', controller.unregisterParticipant);
router.patch('/:id/participants/:memberId/confirm', controller.confirmAttendance);

// Acciones de estado
router.patch('/:id/status', controller.changeStatus);
router.patch('/:id/cancel', controller.cancel);
router.patch('/:id/postpone', controller.postpone);
router.post('/:id/match-result', controller.recordMatchResult);

export default router;
