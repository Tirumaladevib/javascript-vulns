import { User } from "../../types/user";
import { apiClient } from "./api";

type AuthRequestParam = {
  readonly orgIdToken?: string;
  readonly meritMemberId?: string;
  readonly memberIdToken?: string;
};

type LoginWithMeritResponse = {
  readonly redirectURL: string;
};

type LoginWithMeritRequestParam = {
  readonly state: string;
};

type LoginUserResponse = {
  readonly meritMemberId: string;
};

type LinkWithMeritResponse = LoginWithMeritResponse;
type LinkWithMeritRequestParam = LoginWithMeritRequestParam;

export function createAuthClient() {
  const loginWithMerit = (data: LoginWithMeritRequestParam) =>
    apiClient.get<LoginWithMeritResponse, LoginWithMeritRequestParam>(
      "/login-with-merit",
      data
    );

  const linkWithMerit = (data: LoginWithMeritRequestParam) =>
    apiClient.get<LinkWithMeritResponse, LinkWithMeritRequestParam>(
      "link-with-merit",
      data
    );

  const logout = () => apiClient.get("/logout");

  const loginUser = ({ memberIdToken }: AuthRequestParam) =>
    apiClient.get<LoginUserResponse, AuthRequestParam>("/success", {
      memberIdToken,
    });

  const authorizeOrg = ({ meritMemberId, orgIdToken }: AuthRequestParam) =>
    apiClient.get<User, AuthRequestParam>("/success", {
      meritMemberId,
      orgIdToken,
    });

  return {
    authorizeOrg,
    linkWithMerit,
    loginUser,
    loginWithMerit,
    logout,
  };
}

export const authClient = createAuthClient();
