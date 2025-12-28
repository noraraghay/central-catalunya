import { Request, Response, NextFunction } from 'express';

// Clase personalizada para errores de la API
export class ApiError extends Error {
  statusCode: number;
  code: string;
  
  constructor(statusCode: number, message: string, code: string = 'API_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }
  
  static badRequest(message: string, code: string = 'BAD_REQUEST') {
    return new ApiError(400, message, code);
  }
  
  static unauthorized(message: string = 'No autorizado') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  
  static forbidden(message: string = 'Acceso denegado') {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  
  static notFound(message: string = 'Recurso no encontrado') {
    return new ApiError(404, message, 'NOT_FOUND');
  }
  
  static conflict(message: string, code: string = 'CONFLICT') {
    return new ApiError(409, message, code);
  }
  
  static internal(message: string = 'Error interno del servidor') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}

// Middleware de manejo de errores
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // Errores de Firebase
  if (err.name === 'FirebaseError') {
    const firebaseErr = err as any;
    return res.status(400).json({
      success: false,
      error: {
        code: firebaseErr.code || 'FIREBASE_ERROR',
        message: firebaseErr.message
      }
    });
  }
  
  // Error genérico
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : err.message
    }
  });
};

// Middleware para rutas no encontradas
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta ${req.method} ${req.path} no encontrada`
    }
  });
};

// Wrapper para manejar errores en funciones async
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
