import "@fontsource-variable/inter";
import "terminal.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import Application from "./application";
import ApplicationContextProvider from "./context/context";
import { AppQueryClientProvider } from "./queryClient";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppQueryClientProvider>
      <ApplicationContextProvider>
        <Application />
      </ApplicationContextProvider>
    </AppQueryClientProvider>
  </React.StrictMode>,
);
