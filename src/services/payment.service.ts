import { BaseService } from './base.service';
import { COLLECTIONS, db } from '../config/firebase';
import { 
  Payment, 
  CreatePayment, 
  PaymentStatus, 
  PaymentType,
  Member 
} from '../models';

export class PaymentService extends BaseService<Payment> {
  constructor() {
    super(COLLECTIONS.PAYMENTS);
  }

  // Crear pago
  async createPayment(data: CreatePayment): Promise<Payment> {
    const receiptNumber = await this.generateReceiptNumber();
    
    const paymentData = {
      ...data,
      receiptNumber,
      totalAmount: data.amount - (data.discount || 0) + (data.surcharge || 0),
    };

    return this.create(paymentData as Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>);
  }

  // Generar número de recibo
  private async generateReceiptNumber(): Promise<string> {
    const sequence = await this.getNextSequence('receipt_number');
    const year = new Date().getFullYear();
    return `REC-${year}-${sequence.toString().padStart(6, '0')}`;
  }

  // Crear mensualidad
  async createMonthlyFee(
    memberId: string,
    month: number,
    year: number,
    amount: number,
    dueDate: Date
  ): Promise<Payment> {
    return this.createPayment({
      memberId,
      type: PaymentType.MONTHLY_FEE,
      concept: `Mensualidad ${this.getMonthName(month)} ${year}`,
      period: { month, year },
      amount,
      totalAmount: amount,
      status: PaymentStatus.PENDING,
      dueDate,
    });
  }

  // Generar mensualidades para todos los miembros activos
  async generateMonthlyFees(
    month: number,
    year: number,
    amount: number,
    dueDate: Date
  ): Promise<Payment[]> {
    // Obtener miembros activos
    const membersSnapshot = await db.collection(COLLECTIONS.MEMBERS)
      .where('status', '==', 'activo')
      .get();

    const payments: Payment[] = [];

    for (const doc of membersSnapshot.docs) {
      const member = doc.data() as Member;
      
      // Verificar si ya existe la mensualidad para este mes
      const existing = await this.findWhere([
        { field: 'memberId', operator: '==', value: member.id },
        { field: 'type', operator: '==', value: PaymentType.MONTHLY_FEE },
        { field: 'period.month', operator: '==', value: month },
        { field: 'period.year', operator: '==', value: year },
      ]);

      if (existing.length === 0) {
        const payment = await this.createMonthlyFee(member.id, month, year, amount, dueDate);
        payments.push(payment);
      }
    }

    return payments;
  }

  // Obtener pagos de un miembro
  async getByMember(memberId: string): Promise<Payment[]> {
    return this.findByField('memberId', memberId);
  }

  // Obtener pagos por tipo
  async getByType(type: PaymentType): Promise<Payment[]> {
    return this.findByField('type', type);
  }

  // Obtener pagos por estado
  async getByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.findByField('status', status);
  }

  // Obtener pagos pendientes
  async getPending(): Promise<Payment[]> {
    return this.getByStatus(PaymentStatus.PENDING);
  }

  // Obtener pagos vencidos
  async getOverdue(): Promise<Payment[]> {
    const now = new Date();
    return this.findWhere([
      { field: 'status', operator: '==', value: PaymentStatus.PENDING },
      { field: 'dueDate', operator: '<', value: now },
    ]);
  }

  // Marcar pagos vencidos
  async markOverduePayments(): Promise<number> {
    const now = new Date();
    const pendingPayments = await this.findWhere([
      { field: 'status', operator: '==', value: PaymentStatus.PENDING },
      { field: 'dueDate', operator: '<', value: now },
    ]);

    let count = 0;
    for (const payment of pendingPayments) {
      await this.update(payment.id, { status: PaymentStatus.OVERDUE } as Partial<Payment>);
      count++;
    }

    return count;
  }

  // Obtener mensualidades de un periodo
  async getMonthlyFeesByPeriod(month: number, year: number): Promise<Payment[]> {
    return this.findWhere([
      { field: 'type', operator: '==', value: PaymentType.MONTHLY_FEE },
      { field: 'period.month', operator: '==', value: month },
      { field: 'period.year', operator: '==', value: year },
    ]);
  }

  // Obtener pagos de un miembro por tipo
  async getMemberPaymentsByType(memberId: string, type: PaymentType): Promise<Payment[]> {
    return this.findWhere([
      { field: 'memberId', operator: '==', value: memberId },
      { field: 'type', operator: '==', value: type },
    ]);
  }

  // Obtener mensualidades pendientes de un miembro
  async getMemberPendingMonthlyFees(memberId: string): Promise<Payment[]> {
    return this.findWhere([
      { field: 'memberId', operator: '==', value: memberId },
      { field: 'type', operator: '==', value: PaymentType.MONTHLY_FEE },
      { field: 'status', operator: 'in', value: [PaymentStatus.PENDING, PaymentStatus.OVERDUE] },
    ]);
  }

  // Registrar pago
  async registerPayment(
    paymentId: string,
    paymentMethod: string,
    transactionId?: string
  ): Promise<Payment | null> {
    return this.update(paymentId, {
      status: PaymentStatus.PAID,
      paidDate: new Date(),
      paymentMethod,
      transactionId,
    } as Partial<Payment>);
  }

  // Cancelar pago
  async cancel(paymentId: string, reason?: string): Promise<Payment | null> {
    return this.update(paymentId, {
      status: PaymentStatus.CANCELLED,
      notes: reason,
    } as Partial<Payment>);
  }

  // Obtener pagos por rango de fechas
  async getByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    return this.findWhere([
      { field: 'createdAt', operator: '>=', value: startDate },
      { field: 'createdAt', operator: '<=', value: endDate },
    ]);
  }

  // Obtener historial de pagos de un miembro
  async getMemberPaymentHistory(memberId: string): Promise<{
    payments: Payment[];
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
  }> {
    const payments = await this.getByMember(memberId);
    
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    payments.forEach(payment => {
      switch (payment.status) {
        case PaymentStatus.PAID:
          totalPaid += payment.totalAmount;
          break;
        case PaymentStatus.PENDING:
          totalPending += payment.totalAmount;
          break;
        case PaymentStatus.OVERDUE:
          totalOverdue += payment.totalAmount;
          break;
      }
    });

    return {
      payments,
      totalPaid,
      totalPending,
      totalOverdue,
    };
  }

  // Estadísticas de pagos
  async getStatistics(startDate?: Date, endDate?: Date): Promise<{
    total: number;
    byStatus: Record<PaymentStatus, number>;
    byType: Record<PaymentType, number>;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }> {
    let payments: Payment[];

    if (startDate && endDate) {
      payments = await this.getByDateRange(startDate, endDate);
    } else {
      payments = await this.getAll();
    }

    const byStatus = {} as Record<PaymentStatus, number>;
    const byType = {} as Record<PaymentType, number>;
    
    Object.values(PaymentStatus).forEach(s => byStatus[s] = 0);
    Object.values(PaymentType).forEach(t => byType[t] = 0);

    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    payments.forEach(payment => {
      byStatus[payment.status]++;
      byType[payment.type]++;
      totalAmount += payment.totalAmount;

      if (payment.status === PaymentStatus.PAID) {
        paidAmount += payment.totalAmount;
      } else if (payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.OVERDUE) {
        pendingAmount += payment.totalAmount;
      }
    });

    return {
      total: payments.length,
      byStatus,
      byType,
      totalAmount,
      paidAmount,
      pendingAmount,
    };
  }

  // Obtener resumen de ingresos por mes
  async getMonthlyRevenue(year: number): Promise<Array<{ month: number; revenue: number }>> {
    const result: Array<{ month: number; revenue: number }> = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const payments = await this.findWhere([
        { field: 'status', operator: '==', value: PaymentStatus.PAID },
        { field: 'paidDate', operator: '>=', value: startDate },
        { field: 'paidDate', operator: '<=', value: endDate },
      ]);

      const revenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
      result.push({ month, revenue });
    }

    return result;
  }

  // Helper para nombre del mes
  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
  }
}

export const paymentService = new PaymentService();
