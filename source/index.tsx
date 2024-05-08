import "@fontsource-variable/inter";
import "terminal.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import Application from "./application";
import { AppQueryClientProvider } from "./queryClient";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppQueryClientProvider>
      <Application />
    </AppQueryClientProvider>
  </React.StrictMode>,
);
