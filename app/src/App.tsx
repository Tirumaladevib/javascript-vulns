import "./less/index.less";
import { LoadingScreen } from "./components/LoadingScreen";
import { None } from "./utils/None";
import { RouteChangeListener } from "./components/RouteChangeListener";
import { BrowserRouter as Router } from "react-router-dom";
import { UserState, useUserStore } from "./stores/userStore";
import { routes } from "./route";
import { userClient } from "./api-client/createUserClient";
import React, { Suspense, useEffect, useState } from "react";

const setUserSelector = (state: UserState) => state.setUser;
const userSelector = (state: UserState) => state.user;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useUserStore(setUserSelector);
  const user = useUserStore(userSelector);

  useEffect(() => {
    const getLoggedInUser = async () => {
      try {
        const me = await userClient.getUserInfo();
        setUser(me);
      } catch (err: unknown) {}
      setIsLoading(false);
    };

    if (None(user)) {
      getLoggedInUser();
    } else {
      setIsLoading(false);
    }
  }, [setUser, user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <RouteChangeListener />
      <Suspense fallback={<LoadingScreen />} />
      {routes}
    </Router>
  );
}

export default App;
