/**
 * Helper methods for working with dates
 */
export class DateHelper {
  /**
   * Get the current date in ISO format (YYYY-MM-DD)
   */
  static getCurrentDateISO(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  /**
   * Get the current date and time in ISO format
   */
  static getCurrentDateTimeISO(): string {
    return new Date().toISOString();
  }

  /**
   * Format a date in a specified format
   * @param date - The date to format
   * @param format - The format string (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY')
   */
  static formatDate(date: Date, format: string): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return format
      .replace("YYYY", year)
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  }

  /**
   * Add a specified number of days to a date
   * @param date - The starting date
   * @param days - The number of days to add
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Get a date that is a specified number of days in the future
   * @param days - The number of days in the future
   */
  static getFutureDate(days: number): Date {
    return this.addDays(new Date(), days);
  }

  /**
   * Get a date that is a specified number of days in the past
   * @param days - The number of days in the past
   */
  static getPastDate(days: number): Date {
    return this.addDays(new Date(), -days);
  }

  /**
   * Get the time difference between two dates in milliseconds
   * @param date1 - The first date
   * @param date2 - The second date
   */
  static getTimeDifference(date1: Date, date2: Date): number {
    return date2.getTime() - date1.getTime();
  }

  /**
   * Get the time difference between two dates in days
   * @param date1 - The first date
   * @param date2 - The second date
   */
  static getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if a date is a weekend (Saturday or Sunday)
   * @param date - The date to check
   */
  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }

  /**
   * Check if a date is within a specified range
   * @param date - The date to check
   * @param startDate - The start of the range
   * @param endDate - The end of the range
   */
  static isWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  /**
   * Generate a random date within a range
   * @param startDate - The start of the range
   * @param endDate - The end of the range
   */
  static getRandomDate(startDate: Date, endDate: Date): Date {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime);
  }

  /**
   * Convert a string date to a Date object
   * @param dateString - The date string to convert
   */
  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}
