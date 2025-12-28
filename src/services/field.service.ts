import { BaseService } from './base.service';
import { COLLECTIONS, db } from '../config/firebase';
import { 
  Field, 
  CreateField, 
  FieldStatus, 
  FieldType,
  FieldBooking,
  BookingStatus,
  PaymentStatus 
} from '../models';

export class FieldService extends BaseService<Field> {
  constructor() {
    super(COLLECTIONS.FIELDS);
  }

  // Crear cancha
  async createField(data: CreateField): Promise<Field> {
    const fieldData = {
      ...data,
      status: data.status || FieldStatus.AVAILABLE,
    };

    return this.create(fieldData as Omit<Field, 'id' | 'createdAt' | 'updatedAt'>);
  }

  // Obtener canchas disponibles
  async getAvailable(): Promise<Field[]> {
    return this.findByField('status', FieldStatus.AVAILABLE);
  }

  // Obtener canchas por tipo
  async getByType(type: FieldType): Promise<Field[]> {
    return this.findByField('type', type);
  }

  // Cambiar estado de cancha
  async changeStatus(fieldId: string, status: FieldStatus): Promise<Field | null> {
    return this.update(fieldId, { status } as Partial<Field>);
  }

  // Verificar disponibilidad para una fecha y hora específica
  async checkAvailability(
    fieldId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const field = await this.getById(fieldId);
    if (!field || field.status === FieldStatus.MAINTENANCE) {
      return false;
    }

    // Obtener reservas existentes para esa fecha
    const bookingsRef = db.collection(COLLECTIONS.BOOKINGS);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const existingBookings = await bookingsRef
      .where('fieldId', '==', fieldId)
      .where('date', '>=', dateStart)
      .where('date', '<=', dateEnd)
      .where('status', 'in', [BookingStatus.PENDING, BookingStatus.CONFIRMED])
      .get();

    // Verificar solapamiento de horarios
    for (const doc of existingBookings.docs) {
      const booking = doc.data() as FieldBooking;
      if (this.timesOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
        return false;
      }
    }

    return true;
  }

  // Verificar si dos rangos de tiempo se solapan
  private timesOverlap(
    start1: string, 
    end1: string, 
    start2: string, 
    end2: string
  ): boolean {
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  // Obtener horarios disponibles para una fecha
  async getAvailableSlots(fieldId: string, date: Date): Promise<Array<{ start: string; end: string }>> {
    const field = await this.getById(fieldId);
    if (!field) return [];

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const hours = isWeekend ? field.availableHours.weekends : field.availableHours.weekdays;
    
    // Generar slots de 1 hora
    const slots: Array<{ start: string; end: string }> = [];
    const [startHour] = hours.start.split(':').map(Number);
    const [endHour] = hours.end.split(':').map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      const isAvailable = await this.checkAvailability(fieldId, date, start, end);
      if (isAvailable) {
        slots.push({ start, end });
      }
    }

    return slots;
  }

  // Calcular precio de reserva
  calculateBookingPrice(
    field: Field,
    startTime: string,
    endTime: string,
    isWeekend: boolean,
    withLighting: boolean,
    isMember: boolean
  ): number {
    // Calcular horas
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const hours = (endHour + endMin / 60) - (startHour + startMin / 60);

    let price = field.pricing.hourlyRate * hours;

    // Aplicar recargo de fin de semana
    if (isWeekend) {
      price *= (1 + field.pricing.weekendSurcharge / 100);
    }

    // Añadir cargo por iluminación
    if (withLighting) {
      price += field.pricing.lightingSurcharge * hours;
    }

    // Aplicar descuento de socio
    if (isMember) {
      price *= (1 - field.pricing.memberDiscount / 100);
    }

    return Math.round(price * 100) / 100; // Redondear a 2 decimales
  }

  // Obtener estadísticas de uso
  async getUsageStats(fieldId: string, startDate: Date, endDate: Date): Promise<{
    totalBookings: number;
    totalHours: number;
    totalRevenue: number;
    occupancyRate: number;
  }> {
    const bookingsRef = db.collection(COLLECTIONS.BOOKINGS);
    
    const bookings = await bookingsRef
      .where('fieldId', '==', fieldId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .where('status', '==', BookingStatus.COMPLETED)
      .get();

    let totalHours = 0;
    let totalRevenue = 0;

    bookings.docs.forEach(doc => {
      const booking = doc.data() as FieldBooking;
      const [startHour] = booking.startTime.split(':').map(Number);
      const [endHour] = booking.endTime.split(':').map(Number);
      totalHours += endHour - startHour;
      
      if (booking.paymentStatus === PaymentStatus.PAID) {
        totalRevenue += booking.totalPrice;
      }
    });

    // Calcular tasa de ocupación (aproximada)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const field = await this.getById(fieldId);
    const availableHoursPerDay = field ? 
      parseInt(field.availableHours.weekdays.end) - parseInt(field.availableHours.weekdays.start) : 12;
    const totalAvailableHours = days * availableHoursPerDay;
    const occupancyRate = totalAvailableHours > 0 ? (totalHours / totalAvailableHours) * 100 : 0;

    return {
      totalBookings: bookings.size,
      totalHours,
      totalRevenue,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };
  }
}

export const fieldService = new FieldService();
