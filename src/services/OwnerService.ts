import { eq, like, and } from 'drizzle-orm';
import { db } from '../database/db';
import { owners } from '../database/schema';
import * as Crypto from 'expo-crypto';

export class OwnerService {
  static async createOwner(data: { name: string; phoneNumber?: string; village?: string; notes?: string }) {
    const id = Crypto.randomUUID();
    const now = Date.now();
    await db.insert(owners).values({
      id,
      name: data.name,
      phoneNumber: data.phoneNumber || null,
      village: data.village || null,
      notes: data.notes || null,
      isActive: true,
      createdAt: now,
    });
    return id;
  }

  static async getActiveOwners(searchQuery: string = '') {
    const query = db.select().from(owners).where(
      and(
        eq(owners.isActive, true),
        searchQuery ? like(owners.name, `%${searchQuery}%`) : undefined
      )
    ).orderBy(owners.name);
    return await query;
  }

  static async getOwnerById(id: string) {
    const result = await db.select().from(owners).where(eq(owners.id, id));
    return result[0] || null;
  }

  static async updateOwner(id: string, data: Partial<{ name: string; phoneNumber: string; village: string; notes: string; isActive: boolean }>) {
    await db.update(owners).set(data).where(eq(owners.id, id));
  }

  static async softDeleteOwner(id: string) {
    await db.update(owners).set({ isActive: false }).where(eq(owners.id, id));
  }
}
