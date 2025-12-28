import { BaseService } from './base.service';
import { COLLECTIONS } from '../config/firebase';
import { 
  Product, 
  CreateProduct, 
  ProductCategory,
  ProductOrder,
  OrderItem,
  OrderStatus,
  PaymentStatus 
} from '../models';

export class ProductService extends BaseService<Product> {
  constructor() {
    super(COLLECTIONS.PRODUCTS);
  }

  // Crear producto
  async createProduct(data: CreateProduct): Promise<Product> {
    const productData = {
      ...data,
      isActive: data.isActive ?? true,
    };

    return this.create(productData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
  }

  // Obtener productos activos
  async getActive(): Promise<Product[]> {
    return this.findByField('isActive', true);
  }

  // Obtener productos por categoría
  async getByCategory(category: ProductCategory): Promise<Product[]> {
    return this.findWhere([
      { field: 'category', operator: '==', value: category },
      { field: 'isActive', operator: '==', value: true },
    ]);
  }

  // Obtener uniformes
  async getUniforms(): Promise<Product[]> {
    return this.getByCategory(ProductCategory.UNIFORM);
  }

  // Obtener equipación de entrenamiento
  async getTrainingKits(): Promise<Product[]> {
    return this.getByCategory(ProductCategory.TRAINING_KIT);
  }

  // Obtener productos con stock bajo
  async getLowStock(threshold: number = 5): Promise<Product[]> {
    const products = await this.findByField('hasStock', true);
    return products.filter(p => (p.stockQuantity || 0) <= threshold);
  }

  // Actualizar stock
  async updateStock(productId: string, quantity: number): Promise<Product | null> {
    return this.update(productId, { stockQuantity: quantity } as Partial<Product>);
  }

  // Reducir stock
  async decreaseStock(productId: string, quantity: number): Promise<Product | null> {
    const product = await this.getById(productId);
    if (!product || !product.hasStock) return null;

    const newQuantity = Math.max(0, (product.stockQuantity || 0) - quantity);
    return this.update(productId, { stockQuantity: newQuantity } as Partial<Product>);
  }

  // Aumentar stock
  async increaseStock(productId: string, quantity: number): Promise<Product | null> {
    const product = await this.getById(productId);
    if (!product) return null;

    const newQuantity = (product.stockQuantity || 0) + quantity;
    return this.update(productId, { stockQuantity: newQuantity } as Partial<Product>);
  }

  // Verificar disponibilidad
  async checkAvailability(productId: string, quantity: number, size?: string): Promise<boolean> {
    const product = await this.getById(productId);
    if (!product || !product.isActive) return false;

    // Si el producto tiene tallas, verificar que la talla esté disponible
    if (size && product.availableSizes && !product.availableSizes.includes(size)) {
      return false;
    }

    // Si el producto tiene control de stock
    if (product.hasStock) {
      return (product.stockQuantity || 0) >= quantity;
    }

    return true;
  }

  // Desactivar producto
  async deactivate(productId: string): Promise<Product | null> {
    return this.update(productId, { isActive: false } as Partial<Product>);
  }

  // Activar producto
  async activate(productId: string): Promise<Product | null> {
    return this.update(productId, { isActive: true } as Partial<Product>);
  }

  // Buscar productos
  async search(searchTerm: string): Promise<Product[]> {
    const products = await this.getActive();
    const term = searchTerm.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  }

  // Obtener precio para miembro
  getPrice(product: Product, isMember: boolean): number {
    if (isMember && product.memberPrice !== undefined) {
      return product.memberPrice;
    }
    return product.price;
  }
}

export class OrderService extends BaseService<ProductOrder> {
  private productService: ProductService;

  constructor() {
    super(COLLECTIONS.ORDERS);
    this.productService = new ProductService();
  }

  // Crear pedido
  async createOrder(
    memberId: string,
    items: Array<{ productId: string; quantity: number; size?: string }>,
    deliveryMethod: 'pickup' | 'delivery',
    isMember: boolean,
    deliveryAddress?: any
  ): Promise<ProductOrder> {
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    // Procesar cada item
    for (const item of items) {
      const product = await this.productService.getById(item.productId);
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`);
      }

      // Verificar disponibilidad
      const available = await this.productService.checkAvailability(
        item.productId, 
        item.quantity, 
        item.size
      );
      if (!available) {
        throw new Error(`Producto no disponible: ${product.name}`);
      }

      const unitPrice = this.productService.getPrice(product, isMember);
      const totalPrice = unitPrice * item.quantity;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        size: item.size,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });

      subtotal += totalPrice;
    }

    const orderData = {
      memberId,
      items: orderItems,
      subtotal,
      total: subtotal,
      status: OrderStatus.PENDING,
      deliveryMethod,
      deliveryAddress,
    };

    const order = await this.create(orderData as Omit<ProductOrder, 'id' | 'createdAt' | 'updatedAt'>);

    // Reducir stock
    for (const item of items) {
      await this.productService.decreaseStock(item.productId, item.quantity);
    }

    return order;
  }

  // Obtener pedidos de un miembro
  async getByMember(memberId: string): Promise<ProductOrder[]> {
    return this.findByField('memberId', memberId);
  }

  // Obtener pedidos por estado
  async getByStatus(status: OrderStatus): Promise<ProductOrder[]> {
    return this.findByField('status', status);
  }

  // Obtener pedidos pendientes
  async getPending(): Promise<ProductOrder[]> {
    return this.getByStatus(OrderStatus.PENDING);
  }

  // Obtener pedidos listos para entregar
  async getReady(): Promise<ProductOrder[]> {
    return this.getByStatus(OrderStatus.READY);
  }

  // Cambiar estado del pedido
  async changeStatus(orderId: string, status: OrderStatus): Promise<ProductOrder | null> {
    return this.update(orderId, { status } as Partial<ProductOrder>);
  }

  // Confirmar pedido
  async confirm(orderId: string): Promise<ProductOrder | null> {
    return this.changeStatus(orderId, OrderStatus.CONFIRMED);
  }

  // Marcar como preparando
  async markPreparing(orderId: string): Promise<ProductOrder | null> {
    return this.changeStatus(orderId, OrderStatus.PREPARING);
  }

  // Marcar como listo
  async markReady(orderId: string): Promise<ProductOrder | null> {
    return this.changeStatus(orderId, OrderStatus.READY);
  }

  // Marcar como entregado
  async markDelivered(orderId: string): Promise<ProductOrder | null> {
    return this.update(orderId, {
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date(),
    } as Partial<ProductOrder>);
  }

  // Cancelar pedido
  async cancel(orderId: string): Promise<ProductOrder | null> {
    const order = await this.getById(orderId);
    if (!order) return null;

    // Restaurar stock
    for (const item of order.items) {
      await this.productService.increaseStock(item.productId, item.quantity);
    }

    return this.changeStatus(orderId, OrderStatus.CANCELLED);
  }

  // Marcar como pagado
  async markPaid(orderId: string, paymentId: string): Promise<ProductOrder | null> {
    return this.update(orderId, { paymentId } as Partial<ProductOrder>);
  }

  // Aplicar descuento
  async applyDiscount(orderId: string, discount: number): Promise<ProductOrder | null> {
    const order = await this.getById(orderId);
    if (!order) return null;

    const newTotal = order.subtotal - discount;
    return this.update(orderId, { 
      discount, 
      total: Math.max(0, newTotal),
    } as Partial<ProductOrder>);
  }

  // Estadísticas de pedidos
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<OrderStatus, number>;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    const orders = await this.getAll();

    const byStatus = {} as Record<OrderStatus, number>;
    Object.values(OrderStatus).forEach(s => byStatus[s] = 0);

    let totalRevenue = 0;

    orders.forEach(order => {
      byStatus[order.status]++;
      if (order.status === OrderStatus.DELIVERED) {
        totalRevenue += order.total;
      }
    });

    const deliveredOrders = byStatus[OrderStatus.DELIVERED];
    const averageOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;

    return {
      total: orders.length,
      byStatus,
      totalRevenue,
      averageOrderValue,
    };
  }
}

export const productService = new ProductService();
export const orderService = new OrderService();
