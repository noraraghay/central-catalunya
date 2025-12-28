import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { ApiError } from './error.middleware';

// Extender el tipo Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        role?: string;
        memberId?: string;
      };
    }
  }
}

// Middleware de autenticación con Firebase
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Token de autenticación requerido');
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      throw ApiError.unauthorized('Token inválido');
    }
    
    // Verificar token con Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role as string,
      memberId: decodedToken.memberId as string
    };
    
    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }
    
    if (error.code === 'auth/id-token-expired') {
      return next(ApiError.unauthorized('Token expirado'));
    }
    
    if (error.code === 'auth/argument-error') {
      return next(ApiError.unauthorized('Token mal formado'));
    }
    
    return next(ApiError.unauthorized('Error de autenticación'));
  }
};

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (token) {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role as string,
        memberId: decodedToken.memberId as string
      };
    }
    
    next();
  } catch (error) {
    // Si hay error, simplemente continuamos sin usuario
    next();
  }
};

// Middleware para verificar roles
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Autenticación requerida'));
    }
    
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(
        `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`
      ));
    }
    
    next();
  };
};

// Roles predefinidos
export const Roles = {
  ADMIN: 'admin',
  COACH: 'coach',
  PLAYER: 'player',
  MEMBER: 'member',
  STAFF: 'staff'
} as const;

// Middleware para verificar si es admin
export const requireAdmin = requireRole(Roles.ADMIN);

// Middleware para verificar si es admin o coach
export const requireAdminOrCoach = requireRole(Roles.ADMIN, Roles.COACH);

// Middleware para verificar si es staff
export const requireStaff = requireRole(Roles.ADMIN, Roles.COACH, Roles.STAFF);
