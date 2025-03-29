/**
 * Utility class for generating test data
 * Implements Factory design pattern
 */
export class DataGenerator {
  private static readonly LETTERS = "abcdefghijklmnopqrstuvwxyz";
  private static readonly NUMBERS = "0123456789";
  private static readonly SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  /**
   * Generate a random string
   * @param length - Length of the string
   * @param includeNumbers - Whether to include numbers
   * @param includeSpecialChars - Whether to include special characters
   */
  static randomString(
    length: number = 10,
    includeNumbers: boolean = false,
    includeSpecialChars: boolean = false,
  ): string {
    let chars = this.LETTERS + this.LETTERS.toUpperCase();
    if (includeNumbers) chars += this.NUMBERS;
    if (includeSpecialChars) chars += this.SPECIAL_CHARS;

    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Generate a random email
   * @param domain - Email domain (default: example.com)
   */
  static randomEmail(domain: string = "example.com"): string {
    const username = this.randomString(8, true).toLowerCase();
    return `${username}@${domain}`;
  }

  /**
   * Generate a random number in a range
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   */
  static randomNumber(min: number = 1, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Generate a random boolean
   * @param trueWeight - Probability of returning true (0-1)
   */
  static randomBoolean(trueWeight: number = 0.5): boolean {
    return Math.random() < trueWeight;
  }

  /**
   * Generate a random date within a range
   * @param startDate - Start date
   * @param endDate - End date
   */
  static randomDate(
    startDate: Date = new Date(2000, 0, 1),
    endDate: Date = new Date(),
  ): Date {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    const randomTimestamp = this.randomNumber(startTimestamp, endTimestamp);
    return new Date(randomTimestamp);
  }

  /**
   * Format a date to YYYY-MM-DD
   * @param date - Date to format
   */
  static formatDate(date: Date = new Date()): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * Generate a random item from an array
   * @param array - Array to pick from
   */
  static randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate a random phone number
   * @param format - Phone number format (use X for random digit)
   */
  static randomPhone(format: string = "+1-XXX-XXX-XXXX"): string {
    return format.replace(/X/g, () =>
      this.NUMBERS.charAt(Math.floor(Math.random() * this.NUMBERS.length)),
    );
  }

  /**
   * Generate a random UUID
   */
  static uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate random address data
   */
  static randomAddress(): {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } {
    const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
    const states = ["NY", "CA", "IL", "TX", "AZ"];
    const countries = ["USA", "Canada", "UK", "Australia", "Germany"];

    return {
      street: `${this.randomNumber(100, 9999)} ${this.randomString(6, false)} St.`,
      city: this.randomItem(cities),
      state: this.randomItem(states),
      zipCode: this.randomString(5, true, false),
      country: this.randomItem(countries),
    };
  }
}
