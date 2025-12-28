import { Request, Response } from 'express';
import { fieldService } from '../services/field.service';
import { bookingService } from '../services/booking.service';
import { CreateField, CreateFieldBooking, FieldStatus, FieldType, BookingStatus } from '../models';

export class FieldController {
  // Crear cancha
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateField = req.body;
      const field = await fieldService.createField(data);
      res.status(201).json({ success: true, data: field });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener todas las canchas
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { type, status } = req.query;

      let fields;

      if (type) {
        fields = await fieldService.getByType(type as FieldType);
      } else if (status === 'available') {
        fields = await fieldService.getAvailable();
      } else {
        fields = await fieldService.getAll();
      }

      res.json({ success: true, data: fields });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener cancha por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const field = await fieldService.getById(id);

      if (!field) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Cancha no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: field });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar cancha
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const field = await fieldService.update(id, data);

      if (!field) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Cancha no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: field });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Eliminar cancha
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await fieldService.delete(id);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Cancha no encontrada' }
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

  // Verificar disponibilidad
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { date, startTime, endTime } = req.query;

      const isAvailable = await fieldService.checkAvailability(
        id,
        new Date(date as string),
        startTime as string,
        endTime as string
      );

      res.json({ success: true, data: { available: isAvailable } });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CHECK_ERROR', message: error.message }
      });
    }
  }

  // Obtener horarios disponibles
  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { date } = req.query;

      const slots = await fieldService.getAvailableSlots(
        id,
        new Date(date as string)
      );

      res.json({ success: true, data: slots });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Calcular precio
  async calculatePrice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startTime, endTime, isWeekend, withLighting, isMember } = req.body;

      const field = await fieldService.getById(id);
      if (!field) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Cancha no encontrada' }
        });
        return;
      }

      const price = fieldService.calculateBookingPrice(
        field,
        startTime,
        endTime,
        isWeekend || false,
        withLighting || false,
        isMember || false
      );

      res.json({ success: true, data: { price } });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CALC_ERROR', message: error.message }
      });
    }
  }

  // Cambiar estado
  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const field = await fieldService.changeStatus(id, status);

      if (!field) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Cancha no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: field });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener estadísticas de uso
  async getUsageStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await fieldService.getUsageStats(
        id,
        new Date(startDate as string),
        new Date(endDate as string)
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

export class BookingController {
  // Crear reserva
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateFieldBooking = req.body;
      data.date = new Date(data.date);
      
      const booking = await bookingService.createBooking(data);
      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener todas las reservas
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { fieldId, userId, date, status, page = 1, limit = 10 } = req.query;

      let bookings;

      if (fieldId) {
        bookings = await bookingService.getByField(fieldId as string);
      } else if (userId) {
        bookings = await bookingService.getByUser(userId as string);
      } else if (date) {
        bookings = await bookingService.getByDate(new Date(date as string));
      } else if (status) {
        bookings = await bookingService.getByStatus(status as BookingStatus);
      } else {
        const result = await bookingService.getPaginated(
          Number(page),
          Number(limit)
        );
        res.json({ success: true, ...result });
        return;
      }

      res.json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener reserva por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.getById(id);

      if (!booking) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: booking });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar reserva
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      
      if (data.date) {
        data.date = new Date(data.date);
      }

      const booking = await bookingService.update(id, data);

      if (!booking) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: booking });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Eliminar reserva
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await bookingService.delete(id);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: { message: 'Reserva eliminada correctamente' } });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'DELETE_ERROR', message: error.message }
      });
    }
  }

  // Confirmar reserva
  async confirm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.confirm(id);

      if (!booking) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: booking });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Cancelar reserva
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const booking = await bookingService.cancel(id, reason);

      if (!booking) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: booking });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Completar reserva
  async complete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.complete(id);

      if (!booking) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: booking });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Marcar como pagada
  async markAsPaid(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentId } = req.body;
      
      const booking = await bookingService.markAsPaid(id, paymentId);

      if (!booking) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' }
        });
        return;
      }

      res.json({ success: true, data: booking });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener reservas de hoy
  async getToday(req: Request, res: Response): Promise<void> {
    try {
      const bookings = await bookingService.getTodayBookings();
      res.json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener próximas reservas
  async getUpcoming(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      const bookings = await bookingService.getUpcoming(Number(limit));
      res.json({ success: true, data: bookings });
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
      const { startDate, endDate } = req.query;
      
      const stats = await bookingService.getStatistics(
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

export const fieldController = new FieldController();
export const bookingController = new BookingController();
