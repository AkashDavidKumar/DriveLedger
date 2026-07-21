import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { db } from '../database/db';
import { workEntries, vehicles, owners } from '../database/schema';

// Simple in-memory cache
const cache = new Map<string, any>();
let cacheEpoch = Date.now();

export class ReportService {
  /**
   * Invalidate cache. Call this from WorkEntryService and SalaryPaymentService on any mutation.
   */
  static invalidateCache() {
    cacheEpoch = Date.now();
    cache.clear();
  }

  private static getCacheKey(method: string, filters: any = {}) {
    return `${method}_${JSON.stringify(filters)}_${cacheEpoch}`;
  }

  /**
   * Generates a unique where clause based on global filters.
   */
  private static applyFilters(filters: any = {}) {
    const conditions = [];
    if (filters.dateFrom) conditions.push(gte(workEntries.date, filters.dateFrom));
    if (filters.dateTo) conditions.push(lte(workEntries.date, filters.dateTo));
    if (filters.ownerId) conditions.push(eq(workEntries.ownerId, filters.ownerId));
    if (filters.vehicleId) conditions.push(eq(workEntries.vehicleId, filters.vehicleId));
    if (filters.paymentType) conditions.push(eq(workEntries.paymentType, filters.paymentType));
    if (filters.salaryStatus) conditions.push(eq(workEntries.salaryStatus, filters.salaryStatus));
    if (filters.workStatus) conditions.push(eq(workEntries.status, filters.workStatus));
    return conditions;
  }

  static async getSummaryMetrics(filters: any = {}) {
    const key = this.getCacheKey('getSummaryMetrics', filters);
    if (cache.has(key)) return cache.get(key);

    const conditions = this.applyFilters(filters);
    
    // SQLite compatible aggregations
    const result = await db.select({
      totalDays: sql<number>`COUNT(DISTINCT ${workEntries.date})`,
      totalTrips: sql<number>`SUM(${workEntries.tripCount})`,
      totalHours: sql<number>`SUM(${workEntries.hours})`,
      totalExpected: sql<number>`SUM(${workEntries.expectedSalary})`,
      totalReceived: sql<number>`SUM(${workEntries.receivedSalary})`,
      totalPending: sql<number>`SUM(${workEntries.pendingSalary})`,
      workCount: sql<number>`COUNT(${workEntries.id})`,
    })
    .from(workEntries)
    .where(and(...conditions));

    const metrics = result[0] || {
      totalDays: 0, totalTrips: 0, totalHours: 0, totalExpected: 0, totalReceived: 0, totalPending: 0, workCount: 0
    };

    cache.set(key, metrics);
    return metrics;
  }

  static async getMonthlyEarnings(filters: any = {}) {
    const key = this.getCacheKey('getMonthlyEarnings', filters);
    if (cache.has(key)) return cache.get(key);

    const conditions = this.applyFilters(filters);
    
    const result = await db.select({
      month: sql<string>`substr(${workEntries.date}, 1, 7)`, // SQLite trick to get YYYY-MM
      expected: sql<number>`SUM(${workEntries.expectedSalary})`,
      received: sql<number>`SUM(${workEntries.receivedSalary})`,
    })
    .from(workEntries)
    .where(and(...conditions))
    .groupBy(sql`substr(${workEntries.date}, 1, 7)`)
    .orderBy(sql`substr(${workEntries.date}, 1, 7) ASC`);

    cache.set(key, result);
    return result;
  }

  static async getTripsByDay(filters: any = {}) {
    const key = this.getCacheKey('getTripsByDay', filters);
    if (cache.has(key)) return cache.get(key);

    const conditions = this.applyFilters(filters);
    
    const result = await db.select({
      date: workEntries.date,
      trips: sql<number>`SUM(${workEntries.tripCount})`
    })
    .from(workEntries)
    .where(and(...conditions))
    .groupBy(workEntries.date)
    .orderBy(workEntries.date);

    cache.set(key, result);
    return result;
  }

  static async getVehicleUsage(filters: any = {}) {
    const key = this.getCacheKey('getVehicleUsage', filters);
    if (cache.has(key)) return cache.get(key);

    const conditions = this.applyFilters(filters);
    
    const result = await db.select({
      vehicleName: vehicles.name,
      hours: sql<number>`SUM(${workEntries.hours})`,
      earnings: sql<number>`SUM(${workEntries.expectedSalary})`
    })
    .from(workEntries)
    .innerJoin(vehicles, eq(workEntries.vehicleId, vehicles.id))
    .where(and(...conditions))
    .groupBy(vehicles.id)
    .orderBy(sql`SUM(${workEntries.expectedSalary}) DESC`);

    cache.set(key, result);
    return result;
  }
  static async getOwnerUsage(filters: any = {}) {
    const key = this.getCacheKey('getOwnerUsage', filters);
    if (cache.has(key)) return cache.get(key);

    const conditions = this.applyFilters(filters);
    
    const result = await db.select({
      ownerName: owners.name,
      hours: sql<number>`SUM(${workEntries.hours})`,
      earnings: sql<number>`SUM(${workEntries.expectedSalary})`
    })
    .from(workEntries)
    .innerJoin(owners, eq(workEntries.ownerId, owners.id))
    .where(and(...conditions))
    .groupBy(owners.id)
    .orderBy(sql`SUM(${workEntries.expectedSalary}) DESC`);

    cache.set(key, result);
    return result;
  }

  static async getDetailedRecords(filters: any = {}) {
    const key = this.getCacheKey('getDetailedRecords', filters);
    if (cache.has(key)) return cache.get(key);

    const conditions = this.applyFilters(filters);
    
    const result = await db.select({
      id: workEntries.id,
      date: workEntries.date,
      ownerName: owners.name,
      vehicleName: vehicles.name,
      paymentType: workEntries.paymentType,
      tripCount: workEntries.tripCount,
      hours: workEntries.hours,
      rate: workEntries.rate,
      expectedSalary: workEntries.expectedSalary,
      receivedSalary: workEntries.receivedSalary,
      pendingSalary: workEntries.pendingSalary,
      salaryStatus: workEntries.salaryStatus,
      status: workEntries.status,
      notes: workEntries.notes
    })
    .from(workEntries)
    .innerJoin(owners, eq(workEntries.ownerId, owners.id))
    .innerJoin(vehicles, eq(workEntries.vehicleId, vehicles.id))
    .where(and(...conditions))
    .orderBy(sql`${workEntries.date} DESC`);

    cache.set(key, result);
    return result;
  }
}
