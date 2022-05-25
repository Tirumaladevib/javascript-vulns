import {
  LINK_WITH_MERIT_STATE_KEY,
  LOGIN_WITH_MERIT_STATE_KEY,
  MERIT_MEMBER_ID,
} from "../constants";
import { UserState, useUserStore } from "../stores/userStore";
import { authClient } from "../api-client/createAuthClient";
import { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const setUserSelector = (state: UserState) => state.setUser;

export function useLoginService() {
  const history = useHistory();
  const setUser = useUserStore(setUserSelector);

  const loginWithMerit = useCallback(async () => {
    try {
      const state = uuidv4();
      sessionStorage.setItem(LOGIN_WITH_MERIT_STATE_KEY, state);

      const { redirectURL } = await authClient.loginWithMerit({ state });
      window.location.assign(redirectURL);
    } catch (err: unknown) {
      sessionStorage.removeItem(LOGIN_WITH_MERIT_STATE_KEY);

      throw err;
    }
  }, []);

  const loginUser = useCallback(
    async (state: string, memberIdToken: string) => {
      try {
        if (state !== sessionStorage.getItem(LOGIN_WITH_MERIT_STATE_KEY)) {
          history.push("/login");
        }

        const res = await authClient.loginUser({ memberIdToken });
        sessionStorage.setItem(MERIT_MEMBER_ID, res.meritMemberId);
      } catch (err: unknown) {
        sessionStorage.removeItem(LOGIN_WITH_MERIT_STATE_KEY);
        throw err;
      }
    },
    [history]
  );

  const linkWithMerit = useCallback(async () => {
    try {
      const state = uuidv4();
      sessionStorage.setItem(LINK_WITH_MERIT_STATE_KEY, state);

      const { redirectURL } = await authClient.linkWithMerit({
        state,
      });
      window.location.assign(redirectURL);
    } catch (err: unknown) {
      sessionStorage.removeItem(LOGIN_WITH_MERIT_STATE_KEY);
      throw err;
    }
  }, []);

  const authorizeOrg = useCallback(
    async (state: string, orgIdToken: string) => {
      try {
        if (state !== sessionStorage.getItem(LINK_WITH_MERIT_STATE_KEY)) {
          history.push("/login");
        }

        const meritMemberId = sessionStorage.getItem(MERIT_MEMBER_ID);

        if (typeof meritMemberId === "string") {
          const user = await authClient.authorizeOrg({
            meritMemberId,
            orgIdToken,
          });

          setUser(user);
          history.push("/dashboard");
        } else {
          history.push("/login");
        }
      } catch (err: unknown) {
        sessionStorage.removeItem(LINK_WITH_MERIT_STATE_KEY);
        sessionStorage.removeItem(MERIT_MEMBER_ID);
        throw err;
      }
    },
    [history, setUser]
  );

  return {
    authorizeOrg,
    linkWithMerit,
    loginUser,
    loginWithMerit,
  };
}
