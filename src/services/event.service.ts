import { BaseService } from './base.service';
import { COLLECTIONS } from '../config/firebase';
import { 
  Event, 
  CreateEvent, 
  EventType, 
  EventStatus,
  EventParticipant 
} from '../models';

export class EventService extends BaseService<Event> {
  constructor() {
    super(COLLECTIONS.EVENTS);
  }

  // Crear evento
  async createEvent(data: CreateEvent): Promise<Event> {
    const eventData = {
      ...data,
      status: data.status || EventStatus.SCHEDULED,
      registeredParticipants: [],
    };

    return this.create(eventData as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>);
  }

  // Obtener eventos por tipo
  async getByType(type: EventType): Promise<Event[]> {
    return this.findByField('type', type);
  }

  // Obtener eventos por estado
  async getByStatus(status: EventStatus): Promise<Event[]> {
    return this.findByField('status', status);
  }

  // Obtener partidos
  async getMatches(): Promise<Event[]> {
    return this.getByType(EventType.MATCH);
  }

  // Obtener entrenamientos
  async getTrainings(): Promise<Event[]> {
    return this.getByType(EventType.TRAINING);
  }

  // Obtener eventos de un equipo
  async getByTeam(teamId: string): Promise<Event[]> {
    const snapshot = await this.collection
      .where('teamIds', 'array-contains', teamId)
      .get();

    return snapshot.docs.map(doc => this.convertTimestamps(doc.data()) as Event);
  }

  // Obtener eventos organizados por un miembro
  async getByOrganizer(memberId: string): Promise<Event[]> {
    return this.findByField('organizer', memberId);
  }

  // Obtener próximos eventos
  async getUpcoming(limit: number = 10): Promise<Event[]> {
    const now = new Date();
    
    const snapshot = await this.collection
      .where('startDateTime', '>=', now)
      .where('status', 'in', [EventStatus.SCHEDULED, EventStatus.IN_PROGRESS])
      .orderBy('startDateTime', 'asc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => this.convertTimestamps(doc.data()) as Event);
  }

  // Obtener eventos pasados
  async getPastEvents(limit: number = 10): Promise<Event[]> {
    const now = new Date();
    
    const snapshot = await this.collection
      .where('endDateTime', '<', now)
      .orderBy('endDateTime', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => this.convertTimestamps(doc.data()) as Event);
  }

  // Obtener eventos de hoy
  async getTodayEvents(): Promise<Event[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return this.findWhere([
      { field: 'startDateTime', operator: '>=', value: todayStart },
      { field: 'startDateTime', operator: '<=', value: todayEnd },
    ]);
  }

  // Obtener eventos de esta semana
  async getThisWeekEvents(): Promise<Event[]> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return this.findWhere([
      { field: 'startDateTime', operator: '>=', value: weekStart },
      { field: 'startDateTime', operator: '<=', value: weekEnd },
    ]);
  }

  // Obtener eventos por rango de fechas
  async getByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.findWhere([
      { field: 'startDateTime', operator: '>=', value: startDate },
      { field: 'startDateTime', operator: '<=', value: endDate },
    ]);
  }

  // Registrar participante
  async registerParticipant(
    eventId: string, 
    memberId: string
  ): Promise<Event | null> {
    const event = await this.getById(eventId);
    if (!event) return null;

    // Verificar si ya está registrado
    const alreadyRegistered = event.registeredParticipants?.some(
      p => p.memberId === memberId
    );
    if (alreadyRegistered) {
      throw new Error('El miembro ya está registrado en este evento');
    }

    // Verificar capacidad máxima
    if (event.maxParticipants && 
        (event.registeredParticipants?.length || 0) >= event.maxParticipants) {
      throw new Error('El evento ha alcanzado su capacidad máxima');
    }

    // Verificar fecha límite de inscripción
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new Error('El plazo de inscripción ha finalizado');
    }

    const participant: EventParticipant = {
      memberId,
      registeredAt: new Date(),
      hasPaid: !event.requiresPayment,
      attendance: 'pending',
    };

    const registeredParticipants = [...(event.registeredParticipants || []), participant];
    return this.update(eventId, { registeredParticipants } as Partial<Event>);
  }

  // Cancelar registro de participante
  async unregisterParticipant(eventId: string, memberId: string): Promise<Event | null> {
    const event = await this.getById(eventId);
    if (!event) return null;

    const registeredParticipants = (event.registeredParticipants || [])
      .filter(p => p.memberId !== memberId);

    return this.update(eventId, { registeredParticipants } as Partial<Event>);
  }

  // Marcar pago de participante
  async markParticipantPaid(
    eventId: string, 
    memberId: string, 
    paymentId: string
  ): Promise<Event | null> {
    const event = await this.getById(eventId);
    if (!event) return null;

    const registeredParticipants = (event.registeredParticipants || []).map(p => {
      if (p.memberId === memberId) {
        return { ...p, hasPaid: true, paymentId };
      }
      return p;
    });

    return this.update(eventId, { registeredParticipants } as Partial<Event>);
  }

  // Confirmar asistencia
  async confirmAttendance(
    eventId: string, 
    memberId: string
  ): Promise<Event | null> {
    const event = await this.getById(eventId);
    if (!event) return null;

    const registeredParticipants = (event.registeredParticipants || []).map(p => {
      if (p.memberId === memberId) {
        return { ...p, attendance: 'confirmed' as const };
      }
      return p;
    });

    return this.update(eventId, { registeredParticipants } as Partial<Event>);
  }

  // Cancelar asistencia
  async cancelAttendance(
    eventId: string, 
    memberId: string
  ): Promise<Event | null> {
    const event = await this.getById(eventId);
    if (!event) return null;

    const registeredParticipants = (event.registeredParticipants || []).map(p => {
      if (p.memberId === memberId) {
        return { ...p, attendance: 'cancelled' as const };
      }
      return p;
    });

    return this.update(eventId, { registeredParticipants } as Partial<Event>);
  }

  // Cambiar estado del evento
  async changeStatus(eventId: string, status: EventStatus): Promise<Event | null> {
    return this.update(eventId, { status } as Partial<Event>);
  }

  // Cancelar evento
  async cancel(eventId: string): Promise<Event | null> {
    return this.changeStatus(eventId, EventStatus.CANCELLED);
  }

  // Posponer evento
  async postpone(eventId: string, newStartDate: Date, newEndDate: Date): Promise<Event | null> {
    return this.update(eventId, { 
      status: EventStatus.POSTPONED,
      startDateTime: newStartDate,
      endDateTime: newEndDate,
    } as Partial<Event>);
  }

  // Registrar resultado de partido
  async recordMatchResult(
    eventId: string, 
    homeGoals: number, 
    awayGoals: number
  ): Promise<Event | null> {
    const event = await this.getById(eventId);
    if (!event || event.type !== EventType.MATCH || !event.matchDetails) {
      return null;
    }

    const matchDetails = {
      ...event.matchDetails,
      result: { homeGoals, awayGoals },
    };

    return this.update(eventId, { 
      matchDetails,
      status: EventStatus.COMPLETED,
    } as Partial<Event>);
  }

  // Obtener estadísticas de eventos
  async getStatistics(startDate?: Date, endDate?: Date): Promise<{
    total: number;
    byType: Record<EventType, number>;
    byStatus: Record<EventStatus, number>;
    totalParticipants: number;
    averageParticipants: number;
  }> {
    let events: Event[];

    if (startDate && endDate) {
      events = await this.getByDateRange(startDate, endDate);
    } else {
      events = await this.getAll();
    }

    const byType = {} as Record<EventType, number>;
    const byStatus = {} as Record<EventStatus, number>;
    
    Object.values(EventType).forEach(t => byType[t] = 0);
    Object.values(EventStatus).forEach(s => byStatus[s] = 0);

    let totalParticipants = 0;

    events.forEach(event => {
      byType[event.type]++;
      byStatus[event.status]++;
      totalParticipants += event.registeredParticipants?.length || 0;
    });

    return {
      total: events.length,
      byType,
      byStatus,
      totalParticipants,
      averageParticipants: events.length > 0 ? totalParticipants / events.length : 0,
    };
  }
}

export const eventService = new EventService();
