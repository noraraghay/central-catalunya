import { Request, Response } from 'express';
import { teamService } from '../services/team.service';
import { CreateTeam, Gender, Category } from '../models';

export class TeamController {
  // Crear equipo
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateTeam = req.body;
      const team = await teamService.createTeam(data);
      res.status(201).json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener todos los equipos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { gender, category, season, active } = req.query;

      let teams;

      if (gender) {
        teams = await teamService.getByGender(gender as Gender);
      } else if (category) {
        teams = await teamService.getByCategory(category as Category);
      } else if (season) {
        teams = await teamService.getBySeason(season as string);
      } else if (active === 'true') {
        teams = await teamService.getActiveTeams();
      } else {
        teams = await teamService.getAll();
      }

      res.json({ success: true, data: teams });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener equipo por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const team = await teamService.getById(id);

      if (!team) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Equipo no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar equipo
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const team = await teamService.update(id, data);

      if (!team) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Equipo no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Eliminar equipo
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await teamService.delete(id);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Equipo no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: { deleted: true } });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'DELETE_ERROR', message: error.message }
      });
    }
  }

  // Obtener equipos femeninos
  async getFemaleTeams(req: Request, res: Response): Promise<void> {
    try {
      const teams = await teamService.getFemaleTeams();
      res.json({ success: true, data: teams });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener equipos masculinos
  async getMaleTeams(req: Request, res: Response): Promise<void> {
    try {
      const teams = await teamService.getMaleTeams();
      res.json({ success: true, data: teams });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Añadir jugador
  async addPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { playerId } = req.body;

      const team = await teamService.addPlayer(id, playerId);

      if (!team) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Equipo no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Quitar jugador
  async removePlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id, playerId } = req.params;

      const team = await teamService.removePlayer(id, playerId);

      if (!team) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Equipo no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Asignar entrenador
  async assignCoach(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { coachId } = req.body;

      const team = await teamService.assignCoach(id, coachId);

      if (!team) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Equipo no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Registrar resultado de partido
  async recordMatchResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { goalsFor, goalsAgainst } = req.body;

      const team = await teamService.recordMatchResult(id, goalsFor, goalsAgainst);

      if (!team) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Equipo no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener clasificación
  async getStandings(req: Request, res: Response): Promise<void> {
    try {
      const { season, gender } = req.query;
      const standings = await teamService.getStandings(
        season as string,
        gender as Gender
      );
      res.json({ success: true, data: standings });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }
}

export const teamController = new TeamController();
