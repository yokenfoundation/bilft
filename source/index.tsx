import "@fontsource-variable/inter";
import "./index.css";
import { render } from "solid-js/web";

import { Application } from "./application";
import { AppQueryClientProvider } from "./queryClient";
import { Route, Router, Routes } from "@solidjs/router";
import { HashNavigator } from "@tma.js/sdk";
import { createIntegration } from "@tma.js/solid-router-integration";

render(
  () => {
    const navigator = new HashNavigator([{}], 0);
    void navigator.attach();

    return (
      <AppQueryClientProvider>
        <Router source={createIntegration(() => navigator)}>
          <Routes>
            <Route component={Application} path={"*"} />
          </Routes>
        </Router>
      </AppQueryClientProvider>
    );
  },
  document.getElementById("root") as HTMLElement,
);
