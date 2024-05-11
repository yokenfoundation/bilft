import "@fontsource-variable/inter";
import "./index.css";
import { render } from "solid-js/web";

import { ProfilePage } from "./ProfilePage";
import { AppQueryClientProvider } from "./queryClient";
import { Route, Router, Routes, useLocation, useNavigate } from "@solidjs/router";
import {
  BackButton,
  HashNavigator,
  init,
  postEvent,
  request,
  retrieveLaunchParams,
  type NavigationEntry,
} from "@tma.js/sdk";
import { createIntegration } from "@tma.js/solid-router-integration";
import { createComputed, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { addPrefix, getProfileId, getSelfUserId, isEqualIds, removePrefix } from "./common";

const { backButton } = init();

const App = () => {
  const isOpenedSelfProfile = isEqualIds(getSelfUserId(), getProfileId());
  const selfEntry: Partial<NavigationEntry> = {
    pathname: `/board/${removePrefix(getSelfUserId())}`,
  };
  console.log({
    isOpenedSelfProfile,
  });
  const navigator = new HashNavigator(
    isOpenedSelfProfile
      ? [selfEntry]
      : [
          selfEntry,
          {
            pathname: `/board/${removePrefix(getProfileId())}`,
          },
        ],
    isOpenedSelfProfile ? 0 : 1,
  );
  void navigator.attach();
  const source = createIntegration(() => navigator);
  console.log(navigator.path);

  onMount(() => {
    postEvent("web_app_ready");
    postEvent("web_app_expand");
  });

  return (
    <AppQueryClientProvider>
      <Router source={source}>
        <Routes>
          <Route component={ProfilePage} path={"/board/:idWithoutPrefix"} />
        </Routes>
      </Router>
    </AppQueryClientProvider>
  );
};

render(App, document.getElementById("root") as HTMLElement);
