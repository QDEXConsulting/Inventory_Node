/**
 * User Model
 * Represents a user in the system
 */

export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.passwordHash = data.password_hash || data.passwordHash;
    this.password = data.password_hash || data.passwordHash;
    this.firstName = data.first_name || data.firstName;
    this.lastName = data.last_name || data.lastName;
    this.role = data.role; // 'admin', 'customer', 'staff'
    this.isActive = data.is_active ?? data.isActive ?? true;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  getFullName() {
    return `${this.lastName} ${this.firstName}`;
  }

  isAdmin() {
    return this.role === 'admin';
  }

  canManageInventory() {
    return this.role === 'admin' || this.role === 'staff';
  }
}

