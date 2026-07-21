import { eq, desc } from 'drizzle-orm';
import { db } from '../database/db';
import { workEntries, salaryPayments, owners, vehicles } from '../database/schema';
import * as Crypto from 'expo-crypto';

export class SalaryPaymentService {
  static async addPayment(workEntryId: string, amount: number, paymentDate: string, notes?: string) {
    // 1. Get work entry
    const entryRes = await db.select().from(workEntries).where(eq(workEntries.id, workEntryId)).limit(1);
    if (!entryRes.length) throw new Error('Work entry not found');
    const entry = entryRes[0];

    // 2. Validate overpayment
    const pending = entry.pendingSalary || 0;
    if (amount > pending) {
      throw new Error(`Payment amount (₹${amount}) cannot exceed pending amount (₹${pending}).`);
    }

    // 3. Insert payment
    const id = Crypto.randomUUID();
    await db.insert(salaryPayments).values({
      id,
      workEntryId,
      amount,
      paymentDate,
      notes: notes || null,
      createdAt: Date.now()
    });

    // 4. Update work entry cached salaries
    const newReceived = (entry.receivedSalary || 0) + amount;
    const newPending = (entry.expectedSalary || 0) - newReceived;
    
    let newStatus = 'pending';
    if (newPending <= 0 && (entry.expectedSalary || 0) > 0) newStatus = 'paid';
    else if (newReceived > 0 && newPending > 0) newStatus = 'partial';
    else if ((entry.expectedSalary || 0) === 0) newStatus = 'paid'; // Edge case

    await db.update(workEntries).set({
      receivedSalary: newReceived,
      pendingSalary: newPending,
      salaryStatus: newStatus
    }).where(eq(workEntries.id, workEntryId));

    return id;
  }

  static async getPaymentsForWorkEntry(workEntryId: string) {
    return await db.select().from(salaryPayments)
      .where(eq(salaryPayments.workEntryId, workEntryId))
      .orderBy(desc(salaryPayments.paymentDate), desc(salaryPayments.createdAt));
  }

  static async getGlobalTimeline() {
    // Join with workEntries, owners to display rich timeline
    return await db.select({
      payment: salaryPayments,
      entry: workEntries,
      owner: owners,
      vehicle: vehicles
    })
    .from(salaryPayments)
    .innerJoin(workEntries, eq(salaryPayments.workEntryId, workEntries.id))
    .innerJoin(owners, eq(workEntries.ownerId, owners.id))
    .innerJoin(vehicles, eq(workEntries.vehicleId, vehicles.id))
    .orderBy(desc(salaryPayments.paymentDate), desc(salaryPayments.createdAt));
  }
}
