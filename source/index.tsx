import "@fontsource-variable/inter";
import "./index.css";
import { render } from "solid-js/web";

import { Application } from "./application";
import { AppQueryClientProvider } from "./queryClient";
import { QueryClientContext, QueryClientProvider } from "@tanstack/solid-query";

render(
  () => (
    <AppQueryClientProvider>
      <Application />
    </AppQueryClientProvider>
  ),
  document.getElementById("root") as HTMLElement,
);
