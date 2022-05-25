import { None } from "../utils/None";
import { Some } from "../utils/Some";
import { UserState, useUserStore } from "../stores/userStore";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
const userSelector = (state: UserState) => state.user;

type HistoryParam = {
  readonly from: string;
};

export function RouteChangeListener() {
  const user = useUserStore(userSelector);
  const history = useHistory<HistoryParam>();
  const { pathname, state } = history.location;
  const targetUrl = None(state) ? "/dashboard" : state.from;

  useEffect(() => {
    if (Some(user)) {
      history.push(targetUrl);
    }
    if (None(user) && !pathname.includes("/success")) {
      history.push("login");
    }
  }, [history, pathname, state, user, targetUrl]);

  return null;
}
