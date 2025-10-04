/**
 * User entity
 */

import { IBaseEntity } from '../interfaces/base.interface';
import { UserRole, UserStatus, IUserPermissions, IUserProfile, IUserAvatar } from '../interfaces/user.interface';

export class User implements IBaseEntity {
  id!: string;
  email!: string;
  password!: string;
  role!: UserRole;
  status!: UserStatus;
  permissions!: IUserPermissions;
  profile!: IUserProfile;
  companyId?: string; // null for SUPER_ADMIN
  lastLoginAt?: Date;
  emailVerified!: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }

  // Helper methods
  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isManager(): boolean {
    return this.role === UserRole.MANAGER;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  canManageUsers(): boolean {
    return this.permissions.canCreateUsers || this.permissions.canDeleteUsers;
  }

  getFullName(): string {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
  }

  // Avatar methods
  hasAvatar(): boolean {
    return !!(this.profile.avatar && this.profile.avatar.url);
  }

  getAvatarUrl(): string | undefined {
    return this.profile.avatar?.url;
  }

  getAvatarThumbnail(): string | undefined {
    return this.profile.avatar?.variants?.thumbnail || this.profile.avatar?.url;
  }

  getAvatarSmall(): string | undefined {
    return this.profile.avatar?.variants?.small || this.profile.avatar?.url;
  }

  getAvatarMedium(): string | undefined {
    return this.profile.avatar?.variants?.medium || this.profile.avatar?.url;
  }

  getAvatarMetadata(): IUserAvatar['metadata'] | undefined {
    return this.profile.avatar?.metadata;
  }

  getAvatarSize(): number | undefined {
    return this.profile.avatar?.metadata?.size;
  }

  getAvatarDimensions(): { width?: number; height?: number } | undefined {
    const metadata = this.getAvatarMetadata();
    if (!metadata) return undefined;
    return {
      width: metadata.width,
      height: metadata.height
    };
  }
}
