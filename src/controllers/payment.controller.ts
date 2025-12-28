import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { CreatePayment, PaymentStatus, PaymentType } from '../models';

export class PaymentController {
  // Crear pago
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreatePayment = req.body;
      data.dueDate = new Date(data.dueDate);
      
      const payment = await paymentService.createPayment(data);
      res.status(201).json({ success: true, data: payment });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener todos los pagos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { memberId, type, status, page = 1, limit = 10 } = req.query;

      let payments;

      if (memberId) {
        payments = await paymentService.getByMember(memberId as string);
      } else if (type) {
        payments = await paymentService.getByType(type as PaymentType);
      } else if (status) {
        payments = await paymentService.getByStatus(status as PaymentStatus);
      } else {
        const result = await paymentService.getPaginated(
          Number(page),
          Number(limit),
          'createdAt',
          'desc'
        );
        res.json({ success: true, ...result });
        return;
      }

      res.json({ success: true, data: payments });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener pago por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await paymentService.getById(id);

      if (!payment) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pago no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: payment });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar pago
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      if (data.dueDate) data.dueDate = new Date(data.dueDate);
      if (data.paidDate) data.paidDate = new Date(data.paidDate);

      const payment = await paymentService.update(id, data);

      if (!payment) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pago no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: payment });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Eliminar pago
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await paymentService.delete(id);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pago no encontrado' }
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

  // Crear mensualidad
  async createMonthlyFee(req: Request, res: Response): Promise<void> {
    try {
      const { memberId, month, year, amount, dueDate } = req.body;
      
      const payment = await paymentService.createMonthlyFee(
        memberId,
        month,
        year,
        amount,
        new Date(dueDate)
      );
      
      res.status(201).json({ success: true, data: payment });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Generar mensualidades para todos los miembros
  async generateMonthlyFees(req: Request, res: Response): Promise<void> {
    try {
      const { month, year, amount, dueDate } = req.body;
      
      const payments = await paymentService.generateMonthlyFees(
        month,
        year,
        amount,
        new Date(dueDate)
      );
      
      res.status(201).json({ 
        success: true, 
        data: { 
          generated: payments.length,
          payments 
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'GENERATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener pagos pendientes
  async getPending(req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentService.getPending();
      res.json({ success: true, data: payments });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener pagos vencidos
  async getOverdue(req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentService.getOverdue();
      res.json({ success: true, data: payments });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Marcar pagos vencidos
  async markOverdue(req: Request, res: Response): Promise<void> {
    try {
      const count = await paymentService.markOverduePayments();
      res.json({ success: true, data: { markedOverdue: count } });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Registrar pago
  async registerPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentMethod, transactionId } = req.body;
      
      const payment = await paymentService.registerPayment(id, paymentMethod, transactionId);

      if (!payment) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pago no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: payment });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Cancelar pago
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const payment = await paymentService.cancel(id, reason);

      if (!payment) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pago no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: payment });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener historial de pagos de un miembro
  async getMemberHistory(req: Request, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;
      const history = await paymentService.getMemberPaymentHistory(memberId);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener mensualidades pendientes de un miembro
  async getMemberPendingFees(req: Request, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;
      const fees = await paymentService.getMemberPendingMonthlyFees(memberId);
      res.json({ success: true, data: fees });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener mensualidades de un periodo
  async getMonthlyFeesByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.query;
      const fees = await paymentService.getMonthlyFeesByPeriod(
        Number(month),
        Number(year)
      );
      res.json({ success: true, data: fees });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener ingresos mensuales
  async getMonthlyRevenue(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.query;
      const revenue = await paymentService.getMonthlyRevenue(Number(year));
      res.json({ success: true, data: revenue });
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
      
      const stats = await paymentService.getStatistics(
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

export const paymentController = new PaymentController();
