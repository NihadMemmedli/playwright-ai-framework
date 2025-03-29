/**
 * Helper methods for working with strings
 */
export class StringHelper {
  /**
   * Generate a random string of specified length
   * @param length - The length of the random string
   * @param charset - The characters to use (defaults to alphanumeric)
   */
  static generateRandomString(
    length: number,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }
    return result;
  }

  /**
   * Generate a UUID (v4)
   */
  static generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Truncate a string to a specified length and add ellipsis if needed
   * @param str - The string to truncate
   * @param maxLength - The maximum length
   * @param ellipsis - The ellipsis string to add (defaults to '...')
   */
  static truncate(str: string, maxLength: number, ellipsis = "..."): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Capitalize the first letter of a string
   * @param str - The string to capitalize
   */
  static capitalize(str: string): string {
    if (!str || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert a string to camelCase
   * @param str - The string to convert
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  /**
   * Convert a string to snake_case
   * @param str - The string to convert
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/\s+/g, "_")
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .toLowerCase();
  }

  /**
   * Convert a string to kebab-case
   * @param str - The string to convert
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/\s+/g, "-")
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase();
  }

  /**
   * Check if a string contains only alphanumeric characters
   * @param str - The string to check
   */
  static isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Check if a string is a valid email address
   * @param str - The string to check
   */
  static isValidEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Mask sensitive information in a string
   * @param str - The string to mask
   * @param visibleChars - Number of visible characters at the start
   * @param maskChar - Character to use for masking
   */
  static maskString(str: string, visibleChars = 4, maskChar = "*"): string {
    if (str.length <= visibleChars) {
      return str;
    }
    const visible = str.substring(0, visibleChars);
    const masked = maskChar.repeat(str.length - visibleChars);
    return visible + masked;
  }

  /**
   * Remove all whitespace from a string
   * @param str - The string to process
   */
  static removeWhitespace(str: string): string {
    return str.replace(/\s+/g, "");
  }

  /**
   * Find and replace all occurrences of a substring in a string
   * @param str - The source string
   * @param search - The substring to find
   * @param replacement - The replacement string
   */
  static replaceAll(str: string, search: string, replacement: string): string {
    return str.split(search).join(replacement);
  }
}
