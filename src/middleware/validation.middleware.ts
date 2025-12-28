import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error.middleware';

// Validador genérico
type ValidationRule = {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'date' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
};

// Middleware de validación
export const validate = (rules: ValidationRule[], source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];
    const errors: string[] = [];
    
    for (const rule of rules) {
      const value = data[rule.field];
      
      // Verificar requerido
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`El campo '${rule.field}' es requerido`);
        continue;
      }
      
      // Si no es requerido y está vacío, saltar validaciones
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Verificar tipo
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`El campo '${rule.field}' debe ser texto`);
            }
            break;
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push(`El campo '${rule.field}' debe ser un número`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
              errors.push(`El campo '${rule.field}' debe ser verdadero o falso`);
            }
            break;
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`El campo '${rule.field}' debe ser un email válido`);
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              errors.push(`El campo '${rule.field}' debe ser una fecha válida`);
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`El campo '${rule.field}' debe ser un array`);
            }
            break;
          case 'object':
            if (typeof value !== 'object' || Array.isArray(value)) {
              errors.push(`El campo '${rule.field}' debe ser un objeto`);
            }
            break;
        }
      }
      
      // Verificar longitud mínima
      if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`El campo '${rule.field}' debe tener al menos ${rule.minLength} caracteres`);
      }
      
      // Verificar longitud máxima
      if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`El campo '${rule.field}' debe tener máximo ${rule.maxLength} caracteres`);
      }
      
      // Verificar valor mínimo
      if (rule.min !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue < rule.min) {
          errors.push(`El campo '${rule.field}' debe ser mayor o igual a ${rule.min}`);
        }
      }
      
      // Verificar valor máximo
      if (rule.max !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > rule.max) {
          errors.push(`El campo '${rule.field}' debe ser menor o igual a ${rule.max}`);
        }
      }
      
      // Verificar patrón
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(`El campo '${rule.field}' tiene un formato inválido`);
      }
      
      // Verificar enum
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`El campo '${rule.field}' debe ser uno de: ${rule.enum.join(', ')}`);
      }
      
      // Validación personalizada
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `El campo '${rule.field}' es inválido`);
        }
      }
    }
    
    if (errors.length > 0) {
      return next(ApiError.badRequest(errors.join('. '), 'VALIDATION_ERROR'));
    }
    
    next();
  };
};

// Validaciones comunes predefinidas
export const validations = {
  // Miembro
  createMember: validate([
    { field: 'firstName', required: true, type: 'string', minLength: 2, maxLength: 50 },
    { field: 'lastName', required: true, type: 'string', minLength: 2, maxLength: 50 },
    { field: 'email', required: true, type: 'email' },
    { field: 'dni', required: true, type: 'string', pattern: /^[0-9]{8}[A-Z]$/ },
    { field: 'phone', type: 'string' },
    { field: 'birthDate', required: true, type: 'date' },
    { field: 'gender', required: true, enum: ['male', 'female', 'other'] }
  ]),
  
  // Equipo
  createTeam: validate([
    { field: 'name', required: true, type: 'string', minLength: 3, maxLength: 100 },
    { field: 'gender', required: true, enum: ['male', 'female', 'mixed'] },
    { field: 'category', required: true, type: 'string' },
    { field: 'season', required: true, type: 'string', pattern: /^\d{4}-\d{4}$/ }
  ]),
  
  // Cancha
  createField: validate([
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'type', required: true, enum: ['football_11', 'football_7', 'football_5', 'indoor'] },
    { field: 'pricePerHour', required: true, type: 'number', min: 0 }
  ]),
  
  // Reserva
  createBooking: validate([
    { field: 'fieldId', required: true, type: 'string' },
    { field: 'date', required: true, type: 'date' },
    { field: 'startTime', required: true, type: 'string', pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    { field: 'endTime', required: true, type: 'string', pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ }
  ]),
  
  // Evento
  createEvent: validate([
    { field: 'title', required: true, type: 'string', minLength: 3, maxLength: 200 },
    { field: 'type', required: true, enum: ['match', 'training', 'tournament', 'meeting', 'social', 'other'] },
    { field: 'startDate', required: true, type: 'date' },
    { field: 'endDate', required: true, type: 'date' }
  ]),
  
  // Pago
  createPayment: validate([
    { field: 'memberId', required: true, type: 'string' },
    { field: 'type', required: true, enum: ['monthly_fee', 'registration', 'uniform', 'equipment', 'event', 'fine', 'other'] },
    { field: 'amount', required: true, type: 'number', min: 0 },
    { field: 'dueDate', required: true, type: 'date' }
  ]),
  
  // Producto
  createProduct: validate([
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 200 },
    { field: 'category', required: true, enum: ['uniform', 'training_kit', 'equipment', 'merchandise', 'other'] },
    { field: 'price', required: true, type: 'number', min: 0 },
    { field: 'memberPrice', type: 'number', min: 0 }
  ]),
  
  // Pedido
  createOrder: validate([
    { field: 'memberId', required: true, type: 'string' },
    { field: 'items', required: true, type: 'array' }
  ]),
  
  // Paginación
  pagination: validate([
    { field: 'page', type: 'number', min: 1 },
    { field: 'limit', type: 'number', min: 1, max: 100 }
  ], 'query'),
  
  // ID en params
  idParam: validate([
    { field: 'id', required: true, type: 'string', minLength: 1 }
  ], 'params')
};

// Validador de DNI español
export const validateSpanishDNI = (dni: string): boolean => {
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  if (!dniRegex.test(dni)) return false;
  
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(dni.substring(0, 8));
  const expectedLetter = letters[number % 23];
  
  return dni[8] === expectedLetter;
};

// Validador de NIE español
export const validateSpanishNIE = (nie: string): boolean => {
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
  if (!nieRegex.test(nie)) return false;
  
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  let nieNumber = nie.replace('X', '0').replace('Y', '1').replace('Z', '2');
  const number = parseInt(nieNumber.substring(0, 8));
  const expectedLetter = letters[number % 23];
  
  return nie[8] === expectedLetter;
};
