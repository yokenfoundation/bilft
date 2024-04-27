import "terminal.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import Applicaiton from "./application";
import ApplicationContextProvider from "./context/context";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ApplicationContextProvider>
      <Applicaiton />
    </ApplicationContextProvider>
  </React.StrictMode>
);
