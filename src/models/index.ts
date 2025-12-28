// ============================================
// CENTRAL DE CATALUNYA - MODELOS DE DATOS
// ============================================

// Enums
export enum Gender {
  MALE = 'masculino',
  FEMALE = 'femenino',
  MIXED = 'mixto'
}

export enum MemberRole {
  PLAYER = 'jugador',
  COACH = 'entrenador',
  ASSISTANT = 'asistente',
  MANAGER = 'directivo',
  STAFF = 'staff'
}

export enum MemberStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo',
  SUSPENDED = 'suspendido',
  PENDING = 'pendiente'
}

export enum PaymentStatus {
  PENDING = 'pendiente',
  PAID = 'pagado',
  OVERDUE = 'vencido',
  CANCELLED = 'cancelado'
}

export enum PaymentType {
  MONTHLY_FEE = 'mensualidad',
  UNIFORM = 'uniforme',
  EQUIPMENT = 'equipamiento',
  EVENT = 'evento',
  FIELD_RENTAL = 'alquiler_cancha',
  INSCRIPTION = 'inscripcion',
  OTHER = 'otro'
}

export enum FieldStatus {
  AVAILABLE = 'disponible',
  OCCUPIED = 'ocupado',
  MAINTENANCE = 'mantenimiento',
  RESERVED = 'reservado'
}

export enum FieldType {
  GRASS = 'cesped_natural',
  ARTIFICIAL = 'cesped_artificial',
  INDOOR = 'indoor',
  FUTSAL = 'futsal'
}

export enum EventType {
  MATCH = 'partido',
  TRAINING = 'entrenamiento',
  TOURNAMENT = 'torneo',
  MEETING = 'reunion',
  SOCIAL = 'social',
  OTHER = 'otro'
}

export enum EventStatus {
  SCHEDULED = 'programado',
  IN_PROGRESS = 'en_curso',
  COMPLETED = 'completado',
  CANCELLED = 'cancelado',
  POSTPONED = 'pospuesto'
}

export enum BookingStatus {
  PENDING = 'pendiente',
  CONFIRMED = 'confirmado',
  CANCELLED = 'cancelado',
  COMPLETED = 'completado'
}

export enum Category {
  PREBENJAMIN = 'prebenjamin',    // 5-7 años
  BENJAMIN = 'benjamin',          // 8-9 años
  ALEVIN = 'alevin',              // 10-11 años
  INFANTIL = 'infantil',          // 12-13 años
  CADETE = 'cadete',              // 14-15 años
  JUVENIL = 'juvenil',            // 16-18 años
  SENIOR = 'senior',              // 19+ años
  VETERANO = 'veterano'           // 35+ años
}

// Interfaces Base
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// MIEMBROS
// ============================================
export interface Member extends BaseEntity {
  // Datos personales
  firstName: string;
  lastName: string;
  dni: string;
  dateOfBirth: Date;
  gender: Gender;
  email: string;
  phone: string;
  address: Address;
  
  // Datos del club
  memberNumber: string;
  role: MemberRole;
  status: MemberStatus;
  joinDate: Date;
  teams: string[];  // IDs de equipos
  
  // Contacto de emergencia
  emergencyContact: EmergencyContact;
  
  // Datos médicos (opcional)
  medicalInfo?: MedicalInfo;
  
  // Foto
  photoUrl?: string;
  
  // Documentos
  documents?: Document[];
}

export interface Address {
  street: string;
  number: string;
  floor?: string;
  city: string;
  postalCode: string;
  province: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  insuranceCompany?: string;
  insuranceNumber?: string;
}

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadedAt: Date;
}

// ============================================
// EQUIPOS
// ============================================
export interface Team extends BaseEntity {
  name: string;
  gender: Gender;
  category: Category;
  season: string;  // ej: "2024-2025"
  
  // Staff
  coachId?: string;
  assistantCoachIds?: string[];
  
  // Jugadores
  playerIds: string[];
  
  // Horarios de entrenamiento
  trainingSchedule: TrainingSchedule[];
  
  // Competición
  league?: string;
  division?: string;
  
  // Estadísticas
  stats?: TeamStats;
  
  isActive: boolean;
}

export interface TrainingSchedule {
  dayOfWeek: number;  // 0-6 (domingo-sábado)
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  fieldId?: string;
}

export interface TeamStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

// ============================================
// CANCHAS / CAMPOS
// ============================================
export interface Field extends BaseEntity {
  name: string;
  type: FieldType;
  status: FieldStatus;
  
  // Dimensiones
  dimensions: {
    length: number;  // metros
    width: number;   // metros
  };
  
  // Ubicación
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Capacidad y servicios
  capacity: number;
  hasLighting: boolean;
  hasChangingRooms: boolean;
  hasParking: boolean;
  
  // Precios de alquiler
  pricing: FieldPricing;
  
  // Horario de disponibilidad
  availableHours: AvailableHours;
  
  // Fotos
  photoUrls?: string[];
  
  // Notas
  notes?: string;
}

export interface FieldPricing {
  hourlyRate: number;
  memberDiscount: number;  // porcentaje
  weekendSurcharge: number;  // porcentaje
  lightingSurcharge: number;  // cantidad fija
}

export interface AvailableHours {
  weekdays: { start: string; end: string };
  weekends: { start: string; end: string };
}

// ============================================
// RESERVAS DE CANCHAS
// ============================================
export interface FieldBooking extends BaseEntity {
  fieldId: string;
  
  // Quien reserva
  bookedBy: string;  // memberId o nombre si es externo
  isExternalBooking: boolean;
  externalContactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  
  // Detalles de la reserva
  date: Date;
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  
  // Propósito
  purpose: string;
  teamId?: string;
  eventId?: string;
  
  // Estado y pago
  status: BookingStatus;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  
  // Opciones
  withLighting: boolean;
  
  // Notas
  notes?: string;
}

// ============================================
// EVENTOS
// ============================================
export interface Event extends BaseEntity {
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  
  // Fecha y hora
  startDateTime: Date;
  endDateTime: Date;
  
  // Ubicación
  location: {
    fieldId?: string;
    customLocation?: string;
    address?: string;
  };
  
  // Participantes
  organizer: string;  // memberId
  teamIds?: string[];
  participantIds?: string[];
  maxParticipants?: number;
  
  // Para partidos
  matchDetails?: MatchDetails;
  
  // Costo (si aplica)
  cost?: number;
  requiresPayment: boolean;
  
  // Inscripción
  registrationDeadline?: Date;
  registeredParticipants?: EventParticipant[];
  
  // Material/Recursos necesarios
  resources?: string[];
  
  // Notas
  notes?: string;
  
  // Archivos adjuntos
  attachments?: Document[];
}

export interface MatchDetails {
  homeTeam: string;
  awayTeam: string;
  competition?: string;
  matchday?: number;
  result?: {
    homeGoals: number;
    awayGoals: number;
  };
  referee?: string;
}

export interface EventParticipant {
  memberId: string;
  registeredAt: Date;
  hasPaid: boolean;
  paymentId?: string;
  attendance?: 'confirmed' | 'pending' | 'cancelled';
}

// ============================================
// PAGOS Y MENSUALIDADES
// ============================================
export interface Payment extends BaseEntity {
  memberId: string;
  
  // Tipo y concepto
  type: PaymentType;
  concept: string;
  description?: string;
  
  // Periodo (para mensualidades)
  period?: {
    month: number;  // 1-12
    year: number;
  };
  
  // Importes
  amount: number;
  discount?: number;
  surcharge?: number;
  totalAmount: number;
  
  // Estado
  status: PaymentStatus;
  dueDate: Date;
  paidDate?: Date;
  
  // Método de pago
  paymentMethod?: string;
  transactionId?: string;
  
  // Referencias
  relatedEntityId?: string;  // eventId, bookingId, etc.
  relatedEntityType?: string;
  
  // Recibo
  receiptNumber?: string;
  receiptUrl?: string;
  
  // Notas
  notes?: string;
}

// ============================================
// PRODUCTOS/EXTRAS
// ============================================
export interface Product extends BaseEntity {
  name: string;
  description: string;
  category: ProductCategory;
  
  // Precios
  price: number;
  memberPrice?: number;  // Precio para socios
  
  // Stock
  hasStock: boolean;
  stockQuantity?: number;
  
  // Tallas (si aplica)
  availableSizes?: string[];
  
  // Imágenes
  imageUrls?: string[];
  
  // Estado
  isActive: boolean;
}

export enum ProductCategory {
  UNIFORM = 'uniforme',
  TRAINING_KIT = 'equipacion_entrenamiento',
  ACCESSORIES = 'accesorios',
  EQUIPMENT = 'equipamiento',
  MERCHANDISE = 'merchandising',
  OTHER = 'otro'
}

export interface ProductOrder extends BaseEntity {
  memberId: string;
  
  // Productos
  items: OrderItem[];
  
  // Importes
  subtotal: number;
  discount?: number;
  total: number;
  
  // Estado
  status: OrderStatus;
  paymentId?: string;
  
  // Entrega
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: Address;
  deliveredAt?: Date;
  
  // Notas
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'pendiente',
  CONFIRMED = 'confirmado',
  PREPARING = 'preparando',
  READY = 'listo',
  DELIVERED = 'entregado',
  CANCELLED = 'cancelado'
}

// ============================================
// CONFIGURACIÓN DEL CLUB
// ============================================
export interface ClubSettings {
  id: string;
  name: string;
  fullName: string;
  foundedYear: number;
  
  // Contacto
  email: string;
  phone: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  
  // Dirección
  address: Address;
  
  // Logo e imágenes
  logoUrl?: string;
  bannerUrl?: string;
  
  // Configuración de cuotas
  fees: {
    monthlyFee: number;
    inscriptionFee: number;
    familyDiscount: number;  // porcentaje por hermanos
  };
  
  // Temporada actual
  currentSeason: string;
  
  updatedAt: Date;
}

// ============================================
// TIPOS PARA REQUESTS/RESPONSES
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Tipos para crear entidades (sin campos automáticos)
export type CreateMember = Omit<Member, 'id' | 'createdAt' | 'updatedAt' | 'memberNumber'>;
export type CreateTeam = Omit<Team, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateField = Omit<Field, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFieldBooking = Omit<FieldBooking, 'id' | 'createdAt' | 'updatedAt' | 'totalPrice'>;
export type CreateEvent = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type CreatePayment = Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'receiptNumber'>;
export type CreateProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateProductOrder = Omit<ProductOrder, 'id' | 'createdAt' | 'updatedAt'>;
