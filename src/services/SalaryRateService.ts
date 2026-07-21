import { eq, and } from 'drizzle-orm';
import { db } from '../database/db';
import { salaryRates } from '../database/schema';
import * as Crypto from 'expo-crypto';

export class SalaryRateService {
  static async setRate(ownerId: string, vehicleId: string, paymentType: string, rate: number) {
    const existing = await db.select().from(salaryRates).where(
      and(
        eq(salaryRates.ownerId, ownerId),
        eq(salaryRates.vehicleId, vehicleId),
        eq(salaryRates.paymentType, paymentType)
      )
    );

    if (existing.length > 0) {
      await db.update(salaryRates).set({ rate }).where(eq(salaryRates.id, existing[0].id));
    } else {
      await db.insert(salaryRates).values({
        id: Crypto.randomUUID(),
        ownerId,
        vehicleId,
        paymentType,
        rate,
        createdAt: Date.now(),
      });
    }
  }

  static async getRate(ownerId: string, vehicleId: string, paymentType: string) {
    const result = await db.select().from(salaryRates).where(
      and(
        eq(salaryRates.ownerId, ownerId),
        eq(salaryRates.vehicleId, vehicleId),
        eq(salaryRates.paymentType, paymentType)
      )
    );
    return result[0]?.rate || null;
  }
}
