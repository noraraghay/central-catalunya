import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

const router = Router();
const controller = new TeamController();

// CRUD básico
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/female', controller.getFemaleTeams);
router.get('/male', controller.getMaleTeams);
router.get('/standings', controller.getStandings);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Gestión de jugadores y staff
router.post('/:id/players/:playerId', controller.addPlayer);
router.delete('/:id/players/:playerId', controller.removePlayer);
router.post('/:id/coach/:coachId', controller.assignCoach);

// Resultados
router.post('/:id/match-result', controller.recordMatchResult);

export default router;
