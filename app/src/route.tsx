import * as Sentry from "@sentry/react";
import { AuthView } from "./components/AuthLoader.view";
import { CleanerWizard } from "./pages/CleanerWizard";
import { Dashboard } from "./components/DashboardView";
import { EditCleanerWizard } from "./pages/EditCleanerWizard";
import { Integrations } from "@sentry/tracing";
import { LoginView } from "./components/LoginView";
import { None } from "./utils/None";
import {
  Redirect,
  Route,
  RouteProps,
  Switch,
  useLocation,
} from "react-router-dom";
import { RuleComposer } from "./pages/RuleComposer";
import { UserState, useUserStore } from "./stores/userStore";
import { createBrowserHistory } from "history";
import React from "react";

const history = createBrowserHistory();
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "development",
  integrations: [
    new Integrations.BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
    }),
  ],
});

const userSelector = (state: UserState) => state.user;

const PrivateRoute = ({ ...rest }: RouteProps) => {
  const user = useUserStore(userSelector);
  const location = useLocation();

  if (None(user)) {
    return (
      <Redirect
        to={{
          pathname: "/login",
          state: { from: location.pathname },
        }}
      />
    );
  }

  return <Route {...rest} />;
};

export const routes = (
  <Switch>
    <Route component={LoginView} path="/login" />
    <Route component={AuthView} path="/success" />
    <PrivateRoute
      component={RuleComposer}
      path="/cleaners/:cleanerId/composer"
    />
    <PrivateRoute component={CleanerWizard} path="/create-cleaner" />
    <PrivateRoute
      component={EditCleanerWizard}
      path="/cleaners/:cleanerId/edit"
    />
    <PrivateRoute component={Dashboard} exact path="/dashboard" />
  </Switch>
);
