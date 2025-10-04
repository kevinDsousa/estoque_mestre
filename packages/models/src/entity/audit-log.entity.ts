/**
 * Audit Log entity
 */

import { IBaseEntity, IAuditLog } from '../interfaces/base.interface';

export class AuditLogEntity implements IAuditLog {
  id!: string;
  entityType!: string;
  entityId!: string;
  action!: 'CREATE' | 'UPDATE' | 'DELETE';
  changes?: Record<string, any>;
  userId!: string;
  companyId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt!: Date;

  constructor(data: Partial<AuditLogEntity>) {
    Object.assign(this, data);
  }

  // Helper methods
  isCreate(): boolean {
    return this.action === 'CREATE';
  }

  isUpdate(): boolean {
    return this.action === 'UPDATE';
  }

  isDelete(): boolean {
    return this.action === 'DELETE';
  }

  hasChanges(): boolean {
    return !!(this.changes && Object.keys(this.changes).length > 0);
  }

  getChangesCount(): number {
    return this.changes ? Object.keys(this.changes).length : 0;
  }

  getFormattedChanges(): string {
    if (!this.changes) return '';
    
    return Object.entries(this.changes)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  }
}
