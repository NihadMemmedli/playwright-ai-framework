import { ApiClient } from "./ApiClient";
import { User, IUser } from "../models/User";
import { AxiosResponse } from "axios";

/**
 * User Repository implementing Repository pattern for User API interactions
 */
export class UserRepository {
  private apiClient: ApiClient;
  private readonly basePath: string = "/users";

  /**
   * Create a new UserRepository
   * @param apiClient - API client instance
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await this.apiClient.get<any[]>(this.basePath);
    return response.data.map((userData) => User.fromJson(userData));
  }

  /**
   * Get user by ID
   * @param id - User ID
   */
  async getUserById(id: number): Promise<User> {
    const response = await this.apiClient.get<any>(`${this.basePath}/${id}`);
    return User.fromJson(response.data);
  }

  /**
   * Create a new user
   * @param user - User data
   */
  async createUser(user: User): Promise<User> {
    const response = await this.apiClient.post<any>(
      this.basePath,
      user.toJson(),
    );
    return User.fromJson(response.data);
  }

  /**
   * Update user
   * @param id - User ID
   * @param user - User data
   */
  async updateUser(id: number, user: User): Promise<User> {
    const response = await this.apiClient.put<any>(
      `${this.basePath}/${id}`,
      user.toJson(),
    );
    return User.fromJson(response.data);
  }

  /**
   * Delete user
   * @param id - User ID
   */
  async deleteUser(id: number): Promise<boolean> {
    const response = await this.apiClient.delete<any>(`${this.basePath}/${id}`);
    return response.status === 200 || response.status === 204;
  }

  /**
   * Search users by name
   * @param name - Name to search for
   */
  async searchUsersByName(name: string): Promise<User[]> {
    const response = await this.apiClient.get<any[]>(this.basePath, { name });
    return response.data.map((userData) => User.fromJson(userData));
  }

  /**
   * Patch user (partial update)
   * @param id - User ID
   * @param partialUser - Partial user data
   */
  async patchUser(id: number, partialUser: Partial<IUser>): Promise<User> {
    const response = await this.apiClient.patch<any>(
      `${this.basePath}/${id}`,
      partialUser,
    );
    return User.fromJson(response.data);
  }
}
