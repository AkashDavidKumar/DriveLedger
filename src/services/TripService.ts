import { eq, desc } from 'drizzle-orm';
import { db } from '../database/db';
import { trips, workEntries } from '../database/schema';
import * as Crypto from 'expo-crypto';

export class TripService {
  static async addTrip(workEntryId: string, pickupLocation?: string, dropLocation?: string) {
    // Get current trip count
    const entryRes = await db.select({ tripCount: workEntries.tripCount }).from(workEntries).where(eq(workEntries.id, workEntryId));
    if (!entryRes.length) throw new Error('Work entry not found');
    
    const nextTripNumber = (entryRes[0].tripCount || 0) + 1;
    
    const id = Crypto.randomUUID();
    await db.insert(trips).values({
      id,
      workEntryId,
      tripNumber: nextTripNumber,
      pickupLocation: pickupLocation || null,
      dropLocation: dropLocation || null,
      createdAt: Date.now(),
    });

    // Update work entry trip count
    await db.update(workEntries)
      .set({ tripCount: nextTripNumber })
      .where(eq(workEntries.id, workEntryId));

    return id;
  }

  static async removeLastTrip(workEntryId: string) {
    // Find the latest trip
    const latestTrips = await db.select().from(trips)
      .where(eq(trips.workEntryId, workEntryId))
      .orderBy(desc(trips.tripNumber))
      .limit(1);

    if (latestTrips.length === 0) return false; // No trips to remove

    await db.delete(trips).where(eq(trips.id, latestTrips[0].id));

    // Update work entry trip count
    const entryRes = await db.select({ tripCount: workEntries.tripCount }).from(workEntries).where(eq(workEntries.id, workEntryId));
    if (entryRes.length) {
      const currentCount = entryRes[0].tripCount || 0;
      await db.update(workEntries)
        .set({ tripCount: Math.max(0, currentCount - 1) })
        .where(eq(workEntries.id, workEntryId));
    }
    return true;
  }

  static async getTripsForWorkEntry(workEntryId: string) {
    return await db.select().from(trips)
      .where(eq(trips.workEntryId, workEntryId))
      .orderBy(desc(trips.createdAt));
  }
}
