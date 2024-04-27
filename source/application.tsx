import React, { useEffect } from "react";
import Profile from "./pages/profile";
import WebApp from "@twa-dev/sdk";
import LoadingIndicator from "./components/loadingIndicator";
import { useApplicationContext } from "./context/context";

const Applicaiton: React.FunctionComponent = () => {
  const context = useApplicationContext();
  useEffect(() => {
    WebApp.ready();
  }, []);

  return (
    <div className="application">
      <LoadingIndicator context={context} hidden={!context.loading.active()} />
      <Profile context={context}></Profile>
    </div>
  );
};

export default Applicaiton;
