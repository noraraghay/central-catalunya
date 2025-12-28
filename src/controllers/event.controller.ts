import { Request, Response } from 'express';
import { eventService } from '../services/event.service';
import { CreateEvent, EventType, EventStatus } from '../models';

export class EventController {
  // Crear evento
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateEvent = req.body;
      data.startDateTime = new Date(data.startDateTime);
      data.endDateTime = new Date(data.endDateTime);
      if (data.registrationDeadline) {
        data.registrationDeadline = new Date(data.registrationDeadline);
      }
      
      const event = await eventService.createEvent(data);
      res.status(201).json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener todos los eventos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { type, status, teamId, page = 1, limit = 10 } = req.query;

      let events;

      if (type) {
        events = await eventService.getByType(type as EventType);
      } else if (status) {
        events = await eventService.getByStatus(status as EventStatus);
      } else if (teamId) {
        events = await eventService.getByTeam(teamId as string);
      } else {
        const result = await eventService.getPaginated(
          Number(page),
          Number(limit),
          'startDateTime',
          'desc'
        );
        res.json({ success: true, ...result });
        return;
      }

      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener evento por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await eventService.getById(id);

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar evento
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      if (data.startDateTime) data.startDateTime = new Date(data.startDateTime);
      if (data.endDateTime) data.endDateTime = new Date(data.endDateTime);
      if (data.registrationDeadline) data.registrationDeadline = new Date(data.registrationDeadline);

      const event = await eventService.update(id, data);

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Eliminar evento
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await eventService.delete(id);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
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

  // Obtener próximos eventos
  async getUpcoming(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      const events = await eventService.getUpcoming(Number(limit));
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener eventos de hoy
  async getToday(req: Request, res: Response): Promise<void> {
    try {
      const events = await eventService.getTodayEvents();
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener eventos de esta semana
  async getThisWeek(req: Request, res: Response): Promise<void> {
    try {
      const events = await eventService.getThisWeekEvents();
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener partidos
  async getMatches(req: Request, res: Response): Promise<void> {
    try {
      const matches = await eventService.getMatches();
      res.json({ success: true, data: matches });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Registrar participante
  async registerParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { memberId } = req.body;

      const event = await eventService.registerParticipant(id, memberId);

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: { code: 'REGISTER_ERROR', message: error.message }
      });
    }
  }

  // Cancelar registro de participante
  async unregisterParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id, memberId } = req.params;

      const event = await eventService.unregisterParticipant(id, memberId);

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Confirmar asistencia
  async confirmAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { memberId } = req.body;

      const event = await eventService.confirmAttendance(id, memberId);

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Cambiar estado
  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const event = await eventService.changeStatus(id, status);

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Cancelar evento
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await eventService.cancel(id);

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Posponer evento
  async postpone(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newStartDate, newEndDate } = req.body;

      const event = await eventService.postpone(
        id,
        new Date(newStartDate),
        new Date(newEndDate)
      );

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: event });
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
      const { homeGoals, awayGoals } = req.body;

      const event = await eventService.recordMatchResult(id, homeGoals, awayGoals);

      if (!event) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Evento no encontrado o no es un partido' }
        });
        return;
      }

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener estadísticas
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const stats = await eventService.getStatistics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }
}

export const eventController = new EventController();
