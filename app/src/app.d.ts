export interface LoginWithMeritResponse {
  token: string
  member: {
    id: string
    name: {
      firstName: string
      lastName: string
    }
  }
}

export interface LinkWithMeritResponse {
  token: string
  orgId: string
  title: string
}

export interface CleanerResponseObject {
  cleaners: Cleaner[]
  totalPages: number
  currentPage: number
}


export interface CleanerMeritTemplate {
  id: string
  active: boolean
}

export interface ApplicationToken extends MemberApplicationToken, OrgApplicationToken {}

export interface MemberApplicationToken {
  memberToken: string
  memberId: string
  memberName: string
}

export interface OrgApplicationToken {
  orgToken: string
  orgId: string
  orgTitle: string
}

export interface LinkWithMeritRedirectResponse {
  redirectURL: string
}

export interface LoginWithMeritRedirectResponse extends LinkWithMeritRedirectResponse {}
