import { None } from "../utils/None";
import { UserState, useUserStore } from "../stores/userStore";
import { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { userClient } from "../api-client/createUserClient";

const setUserSelector = (state: UserState) => state.setUser;
const userSelector = (state: UserState) => state.user;

export function useUserService() {
  const history = useHistory();
  const user = useUserStore(userSelector);
  const setUser = useUserStore(setUserSelector);

  const getUserInfo = useCallback(async () => {
    try {
      if (None(user)) {
        const me = await userClient.getUserInfo();
        setUser(me);
      }
    } catch (err: unknown) {
      history.push("/login");
    }
  }, [user, setUser, history]);

  return {
    getUserInfo,
  };
}
