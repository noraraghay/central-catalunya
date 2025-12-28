import { Router } from 'express';
import { MemberController } from '../controllers/member.controller';

const router = Router();
const controller = new MemberController();

// CRUD básico
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/statistics', controller.getStatistics);
router.get('/players', controller.getPlayers);
router.get('/coaches', controller.getCoaches);
router.get('/search', controller.search);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Acciones específicas
router.patch('/:id/status', controller.changeStatus);
router.post('/:id/teams/:teamId', controller.addToTeam);
router.delete('/:id/teams/:teamId', controller.removeFromTeam);

export default router;
