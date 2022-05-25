import { User } from "../../types/user";
import create from "zustand";

type OrgParam = {
  readonly orgId: string;
  readonly orgTitle: string;
};

export type UserState = {
  readonly clearUser: () => void;
  readonly hasLoggedIn: () => boolean;
  readonly setOrg: (org: OrgParam) => void;
  readonly setUser: (user: User) => void;
  readonly orgId: string;
  readonly orgTitle: string;
  readonly user?: User;
};

export const useUserStore = create<UserState>((set, get) => ({
  clearUser() {
    set(() => ({
      orgId: "",
      orgTitle: "",
      user: undefined,
    }));
  },
  hasLoggedIn() {
    const user = get().user;
    if (user !== undefined) {
      return true;
    }

    return false;
  },
  orgId: "",
  orgTitle: "",
  setOrg({ orgId, orgTitle }) {
    set(() => ({
      orgId,
      orgTitle,
    }));
  },
  setUser(user: User) {
    set(() => ({
      orgId: user.orgId,
      orgTitle: user.orgTitle,
      user,
    }));
  },
}));
