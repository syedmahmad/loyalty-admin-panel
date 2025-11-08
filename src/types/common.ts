export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdByUser?: UserInfo;
  updatedByUser?: UserInfo;
}

export interface BaseEntity extends AuditFields {
  id: string;
}
