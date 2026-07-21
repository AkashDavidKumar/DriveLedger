import { eq } from 'drizzle-orm';
import { db } from '../database/db';
import { vehicles } from '../database/schema';
import * as Crypto from 'expo-crypto';

export class VehicleService {
  static async createVehicle(data: { name: string; registrationNumber?: string; type: string; defaultPaymentMethod: string; defaultRate: number }) {
    const id = Crypto.randomUUID();
    const now = Date.now();
    await db.insert(vehicles).values({
      id,
      name: data.name,
      registrationNumber: data.registrationNumber || null,
      type: data.type,
      defaultPaymentMethod: data.defaultPaymentMethod,
      defaultRate: data.defaultRate,
      createdAt: now,
    });
    return id;
  }

  static async getVehicles() {
    return await db.select().from(vehicles).orderBy(vehicles.name);
  }

  static async getVehicleById(id: string) {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return result[0] || null;
  }

  static async updateVehicle(id: string, data: Partial<{ name: string; registrationNumber: string; type: string; defaultPaymentMethod: string; defaultRate: number }>) {
    await db.update(vehicles).set(data).where(eq(vehicles.id, id));
  }
}
