import { LoadingScreen } from "./LoadingScreen";
import { useLoginService } from "../services/useLoginService";
import React, { useEffect } from "react";
import queryString from "query-string";

export const AuthView = () => {
  const { authorizeOrg, linkWithMerit, loginUser } = useLoginService();
  useEffect(() => {
    const queryParams = queryString.parse(window.location.search);

    if (
      typeof queryParams.memberIdToken === "string" &&
      typeof queryParams.state === "string"
    ) {
      const { memberIdToken, state } = queryParams;
      (async () => {
        await loginUser(state, memberIdToken);
        await linkWithMerit();
      })();
    }

    if (
      typeof queryParams.orgIdToken === "string" &&
      typeof queryParams.state === "string"
    ) {
      const { orgIdToken, state } = queryParams;
      (async () => {
        await authorizeOrg(state, orgIdToken);
      })();
    }
  });

  return <LoadingScreen />;
};
