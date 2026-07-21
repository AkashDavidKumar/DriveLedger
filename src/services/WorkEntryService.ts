import { eq, and, or, like, inArray, desc, gte, lte } from 'drizzle-orm';
import { db } from '../database/db';
import { workEntries, trips, photos, salaryPayments, owners, vehicles } from '../database/schema';
import * as Crypto from 'expo-crypto';
import { SalaryCalculatorService } from './SalaryCalculatorService';

export class WorkEntryService {
  static async getActiveWorkEntry() {
    const result = await db.select().from(workEntries).where(
      and(
        eq(workEntries.status, 'in_progress'),
        eq(workEntries.isCompleted, false)
      )
    ).limit(1);
    
    return result[0] || null;
  }

  static async getWorkEntryById(id: string) {
    const result = await db.select({
      entry: workEntries,
      owner: owners,
      vehicle: vehicles
    })
    .from(workEntries)
    .leftJoin(owners, eq(workEntries.ownerId, owners.id))
    .leftJoin(vehicles, eq(workEntries.vehicleId, vehicles.id))
    .where(eq(workEntries.id, id))
    .limit(1);

    return result[0] || null;
  }

  static async startWorkEntry(data: {
    date: string;
    ownerId: string;
    vehicleId: string;
    paymentType: string;
    rate: number;
    startTime?: string;
    pickupLocation?: string;
    notes?: string;
  }) {
    const activeEntry = await this.getActiveWorkEntry();
    if (activeEntry) {
      throw new Error('An active work session already exists. Please finish it first.');
    }

    const id = Crypto.randomUUID();
    await db.insert(workEntries).values({
      id,
      date: data.date,
      ownerId: data.ownerId,
      vehicleId: data.vehicleId,
      paymentType: data.paymentType,
      rate: data.rate,
      startTime: data.startTime || new Date().toISOString(),
      pickupLocation: data.pickupLocation || null,
      notes: data.notes || null,
      status: 'in_progress',
      isCompleted: false,
      tripCount: 0,
      expectedSalary: 0,
      receivedSalary: 0,
      pendingSalary: 0,
      salaryStatus: 'pending',
      createdAt: Date.now(),
    });

    return id;
  }

  static async updateWorkEntry(id: string, data: Partial<{
    pickupLocation: string;
    dropLocation: string;
    notes: string;
    startTime: string;
    endTime: string;
    hours: number;
    rate: number;
  }>) {
    const existing = await db.select().from(workEntries).where(eq(workEntries.id, id)).limit(1);
    if (!existing.length) throw new Error('Work entry not found');
    const entry = existing[0];

    const updates: any = { ...data };

    // Auto-calculate expected salary if rate or hours changed
    let expectedSalary = entry.expectedSalary;
    if (data.rate !== undefined || data.hours !== undefined) {
      const rate = data.rate ?? entry.rate;
      const hours = data.hours ?? entry.hours ?? 0;
      expectedSalary = SalaryCalculatorService.calculateSalary(entry.paymentType, rate, hours);
      updates.expectedSalary = expectedSalary;
      
      const received = entry.receivedSalary || 0;
      const pending = expectedSalary - received;
      updates.pendingSalary = pending;
      
      if (pending <= 0 && expectedSalary > 0) updates.salaryStatus = 'paid';
      else if (received > 0 && pending > 0) updates.salaryStatus = 'partial';
      else updates.salaryStatus = 'pending';
    }

    await db.update(workEntries).set(updates).where(eq(workEntries.id, id));
  }

  static async finishWorkEntry(id: string, data: { endTime: string; hours: number }) {
    const existing = await db.select().from(workEntries).where(eq(workEntries.id, id)).limit(1);
    if (!existing.length) throw new Error('Work entry not found');
    const entry = existing[0];

    const expectedSalary = SalaryCalculatorService.calculateSalary(entry.paymentType, entry.rate, data.hours);

    await db.update(workEntries).set({
      endTime: data.endTime,
      hours: data.hours,
      expectedSalary,
      pendingSalary: expectedSalary,
      salaryStatus: expectedSalary > 0 ? 'pending' : 'paid',
      status: 'finished',
      isCompleted: true,
    }).where(eq(workEntries.id, id));
  }

  static async deleteWorkEntry(id: string) {
    // Cascade delete
    await db.delete(trips).where(eq(trips.workEntryId, id));
    await db.delete(photos).where(eq(photos.workEntryId, id));
    await db.delete(salaryPayments).where(eq(salaryPayments.workEntryId, id));
    await db.delete(workEntries).where(eq(workEntries.id, id));
  }

  static async getHistory(filters: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    paymentTypes?: string[];
    vehicleTypes?: string[];
    salaryStatuses?: string[];
    workStatuses?: string[];
    ownerIds?: string[];
    vehicleIds?: string[];
  } = {}) {
    let query = db.select({
      entry: workEntries,
      owner: owners,
      vehicle: vehicles,
    })
    .from(workEntries)
    .leftJoin(owners, eq(workEntries.ownerId, owners.id))
    .leftJoin(vehicles, eq(workEntries.vehicleId, vehicles.id));

    const conditions = [];

    // Search
    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(or(
        like(owners.name, term),
        like(vehicles.name, term),
        like(vehicles.registrationNumber, term),
        like(workEntries.notes, term)
      ));
    }

    // Dates
    if (filters.dateFrom) conditions.push(gte(workEntries.date, filters.dateFrom));
    if (filters.dateTo) conditions.push(lte(workEntries.date, filters.dateTo));

    // Arrays
    if (filters.paymentTypes?.length) conditions.push(inArray(workEntries.paymentType, filters.paymentTypes));
    if (filters.vehicleTypes?.length) conditions.push(inArray(vehicles.type, filters.vehicleTypes));
    if (filters.salaryStatuses?.length) conditions.push(inArray(workEntries.salaryStatus, filters.salaryStatuses));
    if (filters.workStatuses?.length) conditions.push(inArray(workEntries.status, filters.workStatuses));
    if (filters.ownerIds?.length) conditions.push(inArray(workEntries.ownerId, filters.ownerIds));
    if (filters.vehicleIds?.length) conditions.push(inArray(workEntries.vehicleId, filters.vehicleIds));

    // Must be completed (History)
    conditions.push(eq(workEntries.isCompleted, true));

    return await query
      .where(and(...conditions))
      .orderBy(desc(workEntries.date), desc(workEntries.createdAt));
  }
}
