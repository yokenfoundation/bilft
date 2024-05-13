import "@fontsource-variable/inter";
import "./index.css";
import { render } from "solid-js/web";

import { ProfilePage } from "./ProfilePage";
import { AppQueryClientProvider } from "./queryClient";
import { Route } from "@solidjs/router";
import { postEvent, initNavigator, type BrowserNavigatorAnyHistoryItem } from "@tma.js/sdk";
import { createRouter } from "@tma.js/solid-router-integration";
import { onCleanup, onMount } from "solid-js";
import { getProfileId, getSelfUserId, isEqualIds, removePrefix } from "./common";

const App = () => {
  const isOpenedSelfProfile = isEqualIds(getSelfUserId(), getProfileId());
  const selfEntry: BrowserNavigatorAnyHistoryItem<any> = {
    pathname: `/board/${removePrefix(getSelfUserId())}`,
  };
  const navigator = initNavigator("app-navigator-state", {
    hashMode: "default",
  });

  if (isOpenedSelfProfile) {
    navigator.replace(selfEntry);
  } else {
    navigator.replace(selfEntry);
    navigator.push({
      pathname: `/board/${removePrefix(getProfileId())}`,
    });
  }
  void navigator.attach();
  onCleanup(() => {
    void navigator.detach();
  });
  const Router = createRouter(navigator);

  onMount(() => {
    postEvent("web_app_ready");
    postEvent("web_app_expand");
  });

  return (
    <AppQueryClientProvider>
      <Router>
        <Route component={ProfilePage} path={"/board/:idWithoutPrefix"} />
      </Router>
    </AppQueryClientProvider>
  );
};

render(() => <App />, document.getElementById("root") as HTMLElement);
