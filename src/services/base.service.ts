import { db, serverTimestamp, COLLECTIONS } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { BaseEntity, PaginatedResponse } from '../models';

export class BaseService<T extends BaseEntity> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collection() {
    return db.collection(this.collectionName);
  }

  // Crear documento
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const id = uuidv4();
    const now = new Date();
    
    const docData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.doc(id).set(docData);
    return docData as T;
  }

  // Obtener por ID
  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return this.convertTimestamps(doc.data()) as T;
  }

  // Obtener todos
  async getAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => this.convertTimestamps(doc.data()) as T);
  }

  // Obtener con paginación
  async getPaginated(
    page: number = 1,
    limit: number = 10,
    orderBy: string = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedResponse<T>> {
    // Obtener total
    const countSnapshot = await this.collection.count().get();
    const total = countSnapshot.data().count;

    // Obtener documentos paginados
    const offset = (page - 1) * limit;
    const snapshot = await this.collection
      .orderBy(orderBy, orderDirection)
      .offset(offset)
      .limit(limit)
      .get();

    const data = snapshot.docs.map(doc => this.convertTimestamps(doc.data()) as T);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Actualizar
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await docRef.update(updateData);
    
    const updated = await docRef.get();
    return this.convertTimestamps(updated.data()) as T;
  }

  // Eliminar
  async delete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }

    await docRef.delete();
    return true;
  }

  // Buscar por campo
  async findByField(field: string, value: any): Promise<T[]> {
    const snapshot = await this.collection.where(field, '==', value).get();
    return snapshot.docs.map(doc => this.convertTimestamps(doc.data()) as T);
  }

  // Buscar con múltiples condiciones
  async findWhere(conditions: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[]): Promise<T[]> {
    let query: FirebaseFirestore.Query = this.collection;
    
    for (const condition of conditions) {
      query = query.where(condition.field, condition.operator, condition.value);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => this.convertTimestamps(doc.data()) as T);
  }

  // Convertir Timestamps de Firestore a Date
  protected convertTimestamps(data: any): any {
    if (!data) return data;
    
    const converted = { ...data };
    
    for (const key in converted) {
      if (converted[key] && typeof converted[key].toDate === 'function') {
        converted[key] = converted[key].toDate();
      } else if (converted[key] && typeof converted[key] === 'object') {
        converted[key] = this.convertTimestamps(converted[key]);
      }
    }
    
    return converted;
  }

  // Generar número secuencial (para números de socio, recibos, etc.)
  async getNextSequence(sequenceName: string): Promise<number> {
    const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(sequenceName);
    
    const result = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let newValue: number;
      if (!counterDoc.exists) {
        newValue = 1;
        transaction.set(counterRef, { value: newValue });
      } else {
        newValue = (counterDoc.data()?.value || 0) + 1;
        transaction.update(counterRef, { value: newValue });
      }
      
      return newValue;
    });

    return result;
  }
}
