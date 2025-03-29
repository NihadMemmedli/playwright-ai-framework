/**
 * User model for API tests
 * Demonstrates DTO (Data Transfer Object) pattern
 */
export interface IUser {
  id?: number;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    suite?: string;
    city: string;
    zipcode: string;
    geo?: {
      lat: string;
      lng: string;
    };
  };
  company?: {
    name: string;
    catchPhrase?: string;
    bs?: string;
  };
}

/**
 * User class with builder pattern for creating test data
 */
export class User implements IUser {
  id?: number;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    suite?: string;
    city: string;
    zipcode: string;
    geo?: {
      lat: string;
      lng: string;
    };
  };
  company?: {
    name: string;
    catchPhrase?: string;
    bs?: string;
  };

  constructor(data: IUser) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.username = data.username;
    this.phone = data.phone;
    this.website = data.website;
    this.address = data.address;
    this.company = data.company;
  }

  /**
   * Create a builder for User objects (Builder Pattern)
   */
  static builder(): UserBuilder {
    return new UserBuilder();
  }

  /**
   * Create a User object from API response
   * @param json - API response JSON
   */
  static fromJson(json: any): User {
    return new User({
      id: json.id,
      name: json.name,
      email: json.email,
      username: json.username,
      phone: json.phone,
      website: json.website,
      address: json.address,
      company: json.company,
    });
  }

  /**
   * Convert User object to JSON
   */
  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      username: this.username,
      phone: this.phone,
      website: this.website,
      address: this.address,
      company: this.company,
    };
  }
}

/**
 * Builder class for User objects (Builder Pattern)
 */
export class UserBuilder {
  private readonly user: IUser;

  constructor() {
    this.user = {
      name: "",
      email: "",
    };
  }

  /**
   * Set user ID
   */
  withId(id: number): UserBuilder {
    this.user.id = id;
    return this;
  }

  /**
   * Set user name
   */
  withName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  /**
   * Set user email
   */
  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  /**
   * Set username
   */
  withUsername(username: string): UserBuilder {
    this.user.username = username;
    return this;
  }

  /**
   * Set phone
   */
  withPhone(phone: string): UserBuilder {
    this.user.phone = phone;
    return this;
  }

  /**
   * Set website
   */
  withWebsite(website: string): UserBuilder {
    this.user.website = website;
    return this;
  }

  /**
   * Set address
   */
  withAddress(address: {
    street: string;
    suite?: string;
    city: string;
    zipcode: string;
    geo?: {
      lat: string;
      lng: string;
    };
  }): UserBuilder {
    this.user.address = address;
    return this;
  }

  /**
   * Set company
   */
  withCompany(company: {
    name: string;
    catchPhrase?: string;
    bs?: string;
  }): UserBuilder {
    this.user.company = company;
    return this;
  }

  /**
   * Build User object
   */
  build(): User {
    if (!this.user.name || !this.user.email) {
      throw new Error("User must have name and email");
    }
    return new User(this.user);
  }
}
