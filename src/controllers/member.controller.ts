import { Request, Response } from 'express';
import { memberService } from '../services/member.service';
import { CreateMember, MemberStatus, MemberRole } from '../models';

export class MemberController {
  // Crear miembro
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateMember = req.body;
      
      // Verificar si ya existe un miembro con ese DNI
      const existingDni = await memberService.findByDni(data.dni);
      if (existingDni) {
        res.status(400).json({ 
          success: false, 
          error: { code: 'DNI_EXISTS', message: 'Ya existe un miembro con ese DNI' }
        });
        return;
      }

      // Verificar si ya existe un miembro con ese email
      const existingEmail = await memberService.findByEmail(data.email);
      if (existingEmail) {
        res.status(400).json({ 
          success: false, 
          error: { code: 'EMAIL_EXISTS', message: 'Ya existe un miembro con ese email' }
        });
        return;
      }

      const member = await memberService.createMember(data);
      res.status(201).json({ success: true, data: member });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener todos los miembros
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, role } = req.query;

      if (status) {
        const members = await memberService.getByStatus(status as MemberStatus);
        res.json({ success: true, data: members });
        return;
      }

      if (role) {
        const members = await memberService.getByRole(role as MemberRole);
        res.json({ success: true, data: members });
        return;
      }

      const result = await memberService.getPaginated(
        Number(page),
        Number(limit)
      );
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener miembro por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const member = await memberService.getById(id);

      if (!member) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Miembro no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: member });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar miembro
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const member = await memberService.update(id, data);

      if (!member) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Miembro no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: member });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Eliminar miembro
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await memberService.delete(id);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Miembro no encontrado' }
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

  // Buscar por nombre
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({ 
          success: false, 
          error: { code: 'MISSING_QUERY', message: 'Parámetro de búsqueda requerido' }
        });
        return;
      }

      const members = await memberService.searchByName(q as string);
      res.json({ success: true, data: members });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'SEARCH_ERROR', message: error.message }
      });
    }
  }

  // Cambiar estado
  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const member = await memberService.changeStatus(id, status);

      if (!member) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Miembro no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: member });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Añadir a equipo
  async addToTeam(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { teamId } = req.body;

      const member = await memberService.addToTeam(id, teamId);

      if (!member) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Miembro no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: member });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Quitar de equipo
  async removeFromTeam(req: Request, res: Response): Promise<void> {
    try {
      const { id, teamId } = req.params;

      const member = await memberService.removeFromTeam(id, teamId);

      if (!member) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Miembro no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: member });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener jugadores
  async getPlayers(req: Request, res: Response): Promise<void> {
    try {
      const players = await memberService.getPlayers();
      res.json({ success: true, data: players });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener entrenadores
  async getCoaches(req: Request, res: Response): Promise<void> {
    try {
      const coaches = await memberService.getCoaches();
      res.json({ success: true, data: coaches });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener estadísticas
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await memberService.getStatistics();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }
}

export const memberController = new MemberController();
