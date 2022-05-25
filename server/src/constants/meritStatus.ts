export enum MeritStatuses {
  REVOKED = 'Revoked',
  FORFEITED = 'Forfeited',
  ACTIVE = 'Active',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  UNAPPROVED = 'Unapproved',
  TRANSFERRED = 'Transferred',
  UNAPPROVED_UNVERIFIED = 'UnapprovedUnverified'
}

export const ExcludedMeritStatuses: string[] = [
  MeritStatuses.FORFEITED,
  MeritStatuses.REVOKED
]

export const NonEditableStatuses: string[] = [
  MeritStatuses.REVOKED,
  MeritStatuses.REJECTED,
  MeritStatuses.UNAPPROVED,
  MeritStatuses.TRANSFERRED,
  MeritStatuses.UNAPPROVED_UNVERIFIED
]