import { BaseService } from './base.service';
import { COLLECTIONS } from '../config/firebase';
import { 
  FieldBooking, 
  CreateFieldBooking, 
  BookingStatus, 
  PaymentStatus,
  Field 
} from '../models';
import { fieldService } from './field.service';

export class BookingService extends BaseService<FieldBooking> {
  constructor() {
    super(COLLECTIONS.BOOKINGS);
  }

  // Crear reserva
  async createBooking(data: CreateFieldBooking): Promise<FieldBooking | null> {
    // Verificar disponibilidad
    const isAvailable = await fieldService.checkAvailability(
      data.fieldId,
      data.date,
      data.startTime,
      data.endTime
    );

    if (!isAvailable) {
      throw new Error('La cancha no está disponible en el horario seleccionado');
    }

    // Obtener campo para calcular precio
    const field = await fieldService.getById(data.fieldId);
    if (!field) {
      throw new Error('Cancha no encontrada');
    }

    // Calcular precio
    const dayOfWeek = new Date(data.date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const totalPrice = fieldService.calculateBookingPrice(
      field,
      data.startTime,
      data.endTime,
      isWeekend,
      data.withLighting,
      !data.isExternalBooking
    );

    const bookingData = {
      ...data,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalPrice,
    };

    return this.create(bookingData as Omit<FieldBooking, 'id' | 'createdAt' | 'updatedAt'>);
  }

  // Obtener reservas por cancha
  async getByField(fieldId: string): Promise<FieldBooking[]> {
    return this.findByField('fieldId', fieldId);
  }

  // Obtener reservas por usuario
  async getByUser(userId: string): Promise<FieldBooking[]> {
    return this.findByField('bookedBy', userId);
  }

  // Obtener reservas por fecha
  async getByDate(date: Date): Promise<FieldBooking[]> {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return this.findWhere([
      { field: 'date', operator: '>=', value: dateStart },
      { field: 'date', operator: '<=', value: dateEnd },
    ]);
  }

  // Obtener reservas de un rango de fechas
  async getByDateRange(startDate: Date, endDate: Date): Promise<FieldBooking[]> {
    return this.findWhere([
      { field: 'date', operator: '>=', value: startDate },
      { field: 'date', operator: '<=', value: endDate },
    ]);
  }

  // Obtener reservas por estado
  async getByStatus(status: BookingStatus): Promise<FieldBooking[]> {
    return this.findByField('status', status);
  }

  // Obtener reservas pendientes de pago
  async getPendingPayment(): Promise<FieldBooking[]> {
    return this.findByField('paymentStatus', PaymentStatus.PENDING);
  }

  // Confirmar reserva
  async confirm(bookingId: string): Promise<FieldBooking | null> {
    return this.update(bookingId, { status: BookingStatus.CONFIRMED } as Partial<FieldBooking>);
  }

  // Cancelar reserva
  async cancel(bookingId: string, reason?: string): Promise<FieldBooking | null> {
    return this.update(bookingId, { 
      status: BookingStatus.CANCELLED,
      notes: reason,
    } as Partial<FieldBooking>);
  }

  // Completar reserva
  async complete(bookingId: string): Promise<FieldBooking | null> {
    return this.update(bookingId, { status: BookingStatus.COMPLETED } as Partial<FieldBooking>);
  }

  // Marcar como pagada
  async markAsPaid(bookingId: string, paymentId: string): Promise<FieldBooking | null> {
    return this.update(bookingId, { 
      paymentStatus: PaymentStatus.PAID,
      paymentId,
    } as Partial<FieldBooking>);
  }

  // Obtener reservas de hoy
  async getTodayBookings(): Promise<FieldBooking[]> {
    const today = new Date();
    return this.getByDate(today);
  }

  // Obtener próximas reservas
  async getUpcoming(limit: number = 10): Promise<FieldBooking[]> {
    const now = new Date();
    
    const snapshot = await this.collection
      .where('date', '>=', now)
      .where('status', 'in', [BookingStatus.PENDING, BookingStatus.CONFIRMED])
      .orderBy('date', 'asc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => this.convertTimestamps(doc.data()) as FieldBooking);
  }

  // Obtener reservas por equipo
  async getByTeam(teamId: string): Promise<FieldBooking[]> {
    return this.findByField('teamId', teamId);
  }

  // Obtener reservas por evento
  async getByEvent(eventId: string): Promise<FieldBooking[]> {
    return this.findByField('eventId', eventId);
  }

  // Estadísticas de reservas
  async getStatistics(startDate?: Date, endDate?: Date): Promise<{
    total: number;
    byStatus: Record<BookingStatus, number>;
    totalRevenue: number;
    externalBookings: number;
    memberBookings: number;
  }> {
    let bookings: FieldBooking[];

    if (startDate && endDate) {
      bookings = await this.getByDateRange(startDate, endDate);
    } else {
      bookings = await this.getAll();
    }

    const byStatus = {} as Record<BookingStatus, number>;
    Object.values(BookingStatus).forEach(s => byStatus[s] = 0);

    let totalRevenue = 0;
    let externalBookings = 0;
    let memberBookings = 0;

    bookings.forEach(booking => {
      byStatus[booking.status]++;
      
      if (booking.paymentStatus === PaymentStatus.PAID) {
        totalRevenue += booking.totalPrice;
      }

      if (booking.isExternalBooking) {
        externalBookings++;
      } else {
        memberBookings++;
      }
    });

    return {
      total: bookings.length,
      byStatus,
      totalRevenue,
      externalBookings,
      memberBookings,
    };
  }
}

export const bookingService = new BookingService();
