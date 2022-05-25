import {
  LINK_WITH_MERIT_STATE_KEY,
  LOGIN_WITH_MERIT_STATE_KEY,
  MERIT_MEMBER_ID,
} from "../constants";
import { UserState, useUserStore } from "../stores/userStore";
import { authClient } from "../api-client/createAuthClient";
import { useCallback } from "react";
import { useHistory } from "react-router-dom";

const clearUserSelector = (state: UserState) => state.clearUser;

export function useLogoutService() {
  const history = useHistory();
  const clearUser = useUserStore(clearUserSelector);

  const logOut = useCallback(async () => {
    await authClient.logout();
    sessionStorage.removeItem(LOGIN_WITH_MERIT_STATE_KEY);
    sessionStorage.removeItem(LINK_WITH_MERIT_STATE_KEY);
    sessionStorage.removeItem(MERIT_MEMBER_ID);
    clearUser();

    history.push("/login");
  }, [clearUser, history]);

  return {
    logOut,
  };
}
