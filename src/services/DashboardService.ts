import { db } from '../database/db';
import { workEntries, salaryPayments } from '../database/schema';
import { sql, eq } from 'drizzle-orm';
import dayjs from 'dayjs';

export class DashboardService {
  static async getDashboardStats() {
    const today = dayjs().format('YYYY-MM-DD');
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

    // Aggregate Expected Salaries from Work Entries
    const expectedRes = await db.select({
      total: sql<number>`SUM(${workEntries.expectedSalary})`,
      monthly: sql<number>`SUM(CASE WHEN ${workEntries.date} >= ${startOfMonth} THEN ${workEntries.expectedSalary} ELSE 0 END)`,
      today: sql<number>`SUM(CASE WHEN ${workEntries.date} = ${today} THEN ${workEntries.expectedSalary} ELSE 0 END)`,
    })
    .from(workEntries)
    .where(eq(workEntries.isCompleted, true));

    // Aggregate Received Salaries from Payments
    const receivedRes = await db.select({
      total: sql<number>`SUM(${salaryPayments.amount})`
    })
    .from(salaryPayments);

    const totalExpected = expectedRes[0]?.total || 0;
    const monthlyExpected = expectedRes[0]?.monthly || 0;
    const todayExpected = expectedRes[0]?.today || 0;
    
    const totalReceived = receivedRes[0]?.total || 0;
    const totalPending = totalExpected - totalReceived;

    return {
      totalExpected,
      monthlyExpected,
      todayExpected,
      totalReceived,
      totalPending
    };
  }
}
