/**
 * Simple TypeScript example for testing code chunking
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserService {
  private users: Map<string, User> = new Map();

  async createUser(user: User): Promise<void> {
    if (this.users.has(user.id)) {
      throw new Error("User already exists");
    }
    this.users.set(user.id, user);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}
