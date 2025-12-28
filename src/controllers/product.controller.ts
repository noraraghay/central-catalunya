import { Request, Response } from 'express';
import { productService, orderService } from '../services/product.service';
import { CreateProduct, ProductCategory, OrderStatus } from '../models';

export class ProductController {
  // Crear producto
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateProduct = req.body;
      const product = await productService.createProduct(data);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener todos los productos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { category, active, lowStock } = req.query;

      let products;

      if (category) {
        products = await productService.getByCategory(category as ProductCategory);
      } else if (active === 'true') {
        products = await productService.getActive();
      } else if (lowStock) {
        products = await productService.getLowStock(Number(lowStock));
      } else {
        products = await productService.getAll();
      }

      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener producto por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getById(id);

      if (!product) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar producto
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const product = await productService.update(id, data);

      if (!product) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Eliminar producto
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await productService.delete(id);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
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

  // Obtener uniformes
  async getUniforms(req: Request, res: Response): Promise<void> {
    try {
      const uniforms = await productService.getUniforms();
      res.json({ success: true, data: uniforms });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener equipación de entrenamiento
  async getTrainingKits(req: Request, res: Response): Promise<void> {
    try {
      const kits = await productService.getTrainingKits();
      res.json({ success: true, data: kits });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar stock
  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const product = await productService.updateStock(id, quantity);

      if (!product) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Verificar disponibilidad
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity, size } = req.query;

      const available = await productService.checkAvailability(
        id,
        Number(quantity) || 1,
        size as string
      );

      res.json({ success: true, data: { available } });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'CHECK_ERROR', message: error.message }
      });
    }
  }

  // Buscar productos
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({ 
          success: false, 
          error: { code: 'MISSING_QUERY', message: 'Parámetro de búsqueda requerido' }
        });
        return;
      }

      const products = await productService.search(q as string);
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'SEARCH_ERROR', message: error.message }
      });
    }
  }

  // Activar producto
  async activate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.activate(id);

      if (!product) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Desactivar producto
  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.deactivate(id);

      if (!product) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }
}

export class OrderController {
  // Crear pedido
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { memberId, items, deliveryMethod, isMember, deliveryAddress } = req.body;
      
      const order = await orderService.createOrder(
        memberId,
        items,
        deliveryMethod,
        isMember || true,
        deliveryAddress
      );
      
      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: { code: 'CREATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener todos los pedidos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { memberId, status, page = 1, limit = 10 } = req.query;

      let orders;

      if (memberId) {
        orders = await orderService.getByMember(memberId as string);
      } else if (status) {
        orders = await orderService.getByStatus(status as OrderStatus);
      } else {
        const result = await orderService.getPaginated(
          Number(page),
          Number(limit),
          'createdAt',
          'desc'
        );
        res.json({ success: true, ...result });
        return;
      }

      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener pedido por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getById(id);

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Actualizar pedido
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const order = await orderService.update(id, data);

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Eliminar pedido
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await orderService.delete(id);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: { message: 'Pedido eliminado correctamente' } });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'DELETE_ERROR', message: error.message }
      });
    }
  }

  // Obtener pedidos pendientes
  async getPending(req: Request, res: Response): Promise<void> {
    try {
      const orders = await orderService.getPending();
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Obtener pedidos listos
  async getReady(req: Request, res: Response): Promise<void> {
    try {
      const orders = await orderService.getReady();
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  // Confirmar pedido
  async confirm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.confirm(id);

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Marcar como preparando
  async markPreparing(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.markPreparing(id);

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Marcar como listo
  async markReady(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.markReady(id);

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Marcar como entregado
  async markDelivered(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.markDelivered(id);

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Cancelar pedido
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.cancel(id);

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Aplicar descuento
  async applyDiscount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { discount } = req.body;
      
      const order = await orderService.applyDiscount(id, discount);

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Pedido no encontrado' }
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'UPDATE_ERROR', message: error.message }
      });
    }
  }

  // Obtener estadísticas
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await orderService.getStatistics();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }
}

export const productController = new ProductController();
export const orderController = new OrderController();
