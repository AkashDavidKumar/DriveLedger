import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../database/db';
import { workEntries, owners, vehicles } from '../database/schema';

export class CalendarService {
  /**
   * Fetches work entries for a given month and formats them for react-native-calendars `markedDates` prop.
   * Month format: YYYY-MM
   */
  static async getMarkedDates(yearMonth: string) {
    const startOfMonth = `${yearMonth}-01`;
    const endOfMonth = `${yearMonth}-31`;

    const entries = await db.select().from(workEntries).where(
      and(
        gte(workEntries.date, startOfMonth),
        lte(workEntries.date, endOfMonth)
      )
    );

    const marked: Record<string, any> = {};

    entries.forEach(entry => {
      let color = '#94a3b8'; // default gray

      if (entry.status === 'in_progress') {
        color = '#3b82f6'; // Blue for active
      } else if (entry.salaryStatus === 'paid') {
        color = '#10b981'; // Green for paid
      } else if (entry.salaryStatus === 'partial') {
        color = '#f59e0b'; // Amber for partial
      } else if (entry.salaryStatus === 'pending') {
        color = '#ef4444'; // Red for pending
      }

      // If multiple entries on same date, we can use multi-dot, but for simplicity we'll show the highest priority (e.g. pending over paid)
      // Actually, multi-dot is supported by react-native-calendars. Let's just do single dot for now.
      marked[entry.date] = {
        marked: true,
        dotColor: color,
        selectedColor: color, // If they select it
      };
    });

    return marked;
  }

  /**
   * Fetches the detailed work list for a specific selected date.
   */
  static async getEntriesForDate(date: string) {
    return await db.select({
      entry: workEntries,
      owner: owners,
      vehicle: vehicles
    })
    .from(workEntries)
    .leftJoin(owners, eq(workEntries.ownerId, owners.id))
    .leftJoin(vehicles, eq(workEntries.vehicleId, vehicles.id))
    .where(eq(workEntries.date, date))
    .orderBy(workEntries.createdAt);
  }
}
