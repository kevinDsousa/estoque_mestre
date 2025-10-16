/**
 * Quality Inspection entity - Sistema de controle de qualidade
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';

export enum QualityStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}

export interface IQualityInspectionResult {
  criteria: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  notes?: string;
}

export class QualityInspection implements IBaseEntityWithCompany {
  id!: string;
  productId!: string;
  batchNumber!: string;
  inspectionDate!: Date;
  inspectorId!: string;
  companyId!: string;
  
  // Inspection details
  results!: IQualityInspectionResult[];
  status!: QualityStatus;
  notes?: string;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<QualityInspection>) {
    Object.assign(this, data);
  }

  // Helper methods
  isApproved(): boolean {
    return this.status === QualityStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === QualityStatus.REJECTED;
  }

  isPending(): boolean {
    return this.status === QualityStatus.PENDING;
  }

  getPassedResults(): IQualityInspectionResult[] {
    return this.results.filter(result => result.status === 'PASS');
  }

  getFailedResults(): IQualityInspectionResult[] {
    return this.results.filter(result => result.status === 'FAIL');
  }

  getPassRate(): number {
    if (this.results.length === 0) return 0;
    const passed = this.getPassedResults().length;
    return (passed / this.results.length) * 100;
  }

  hasWarnings(): boolean {
    return this.results.some(result => result.status === 'WARNING');
  }

  approve(): void {
    this.status = QualityStatus.APPROVED;
    this.updatedAt = new Date();
  }

  reject(): void {
    this.status = QualityStatus.REJECTED;
    this.updatedAt = new Date();
  }

  markForReview(): void {
    this.status = QualityStatus.NEEDS_REVIEW;
    this.updatedAt = new Date();
  }
}
