import dayjs from 'dayjs';

export class SalaryCalculatorService {
  /**
   * Calculates the expected salary based on payment type and rate
   */
  static calculateSalary(paymentType: string, rate: number, hours: number = 0): number {
    switch (paymentType) {
      case 'per_day':
        return rate;
      case 'half_day':
        return rate / 2;
      case 'per_hour':
        return rate * hours;
      default:
        return 0;
    }
  }

  /**
   * Calculates total hours between a start time and end time.
   * Expects ISO format strings. Returns decimal hours.
   */
  static calculateHours(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 0;
    
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    
    if (!start.isValid() || !end.isValid()) return 0;
    
    const diffInMinutes = end.diff(start, 'minute');
    if (diffInMinutes < 0) return 0; // Handle overnight shifts if needed later by adding 24h
    
    // Round to 2 decimal places for cleaner display (e.g. 6.5 hours)
    return Math.round((diffInMinutes / 60) * 100) / 100;
  }
}
