import "@fontsource-variable/inter";
import "./index.css";
import { render } from "solid-js/web";

import { ProfilePage } from "@/features/ProfilePage/ProfilePage";
import { AppQueryClientProvider } from "./queryClient";
import { Route } from "@solidjs/router";
import {
  postEvent,
  initNavigator,
  type BrowserNavigatorAnyHistoryItem,
  bindThemeParamsCSSVars,
  on,
} from "@tma.js/sdk";
import { createRouter } from "@tma.js/solid-router-integration";
import { onCleanup, onMount } from "solid-js";
import {
  getProfileId,
  getSelfUserId,
  isEqualIds,
  removePrefix,
  themeParams,
} from "@/common";
import { TonConnectProvider } from "@/lib/ton-connect-solid";
import { SetupTonWallet } from "@/features/SetupTonWallet";

const getTonconnectManifestUrl = () => {
  const url = new URL(window.location.href);
  url.hash = "";
  for (const [key] of url.searchParams) {
    url.searchParams.delete(key);
  }

  url.pathname = "tonconnect-manifest.json";
  return url.toString();
};

bindThemeParamsCSSVars(themeParams);

const App = () => {
  const isOpenedSelfProfile = isEqualIds(getSelfUserId(), getProfileId());
  const selfEntry: BrowserNavigatorAnyHistoryItem<any> = {
    pathname: `/board/${removePrefix(getSelfUserId())}`,
  };
  const navigator = initNavigator("app-navigator-state");

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

  onCleanup(
    on("viewport_changed", (e) => {
      if (e.is_state_stable) {
        document.documentElement.style.setProperty(
          "--tg-screen-size",
          `${e.height}px`,
        );
      }
    }),
  );
  postEvent("web_app_request_viewport");

  return (
    <AppQueryClientProvider>
      <TonConnectProvider manifestUrl={getTonconnectManifestUrl()}>
        <SetupTonWallet />
        <Router>
          <Route component={ProfilePage} path={"/board/:idWithoutPrefix"} />
        </Router>
      </TonConnectProvider>
    </AppQueryClientProvider>
  );
};

render(() => <App />, document.getElementById("root") as HTMLElement);
