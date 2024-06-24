import type { BrowserNavigator, BrowserNavigatorEvents } from "@tma.js/sdk";
import { onCleanup } from "solid-js";

export const usePageTransition = ({
  dangerousWillBePatched_navigator: navigator,
}: {
  dangerousWillBePatched_navigator: BrowserNavigator<unknown>;
}) => {
  const startViewTransition = document.startViewTransition?.bind(document);
  if (!startViewTransition) {
    return;
  }
  // we need to make it, but our own, cause of junk frame after popstate
  history.scrollRestoration = "manual";
  type ChangeEvent = BrowserNavigatorEvents<unknown>["change"] & {
    _delay?: Promise<void>;
  };
  const idToScrollPosition = new Map<string, number>();
  let lastViewTransitionFinish: Promise<void> | null = null;
  onCleanup(
    navigator.on("change", (e: ChangeEvent) => {
      if (
        (e.from.hash === e.to.hash &&
          e.from.pathname === e.to.pathname &&
          e.from.search !== e.to.search) ||
        // do not react on replace
        e.delta === 0
      ) {
        return;
      }
      idToScrollPosition.set(e.from.id, window.scrollY);

      if (idToScrollPosition.size > 100) {
        const currentPagesIds = new Set<string>();

        for (const { id } of navigator.history) {
          currentPagesIds.add(id);
        }

        const idsForRemove: string[] = [];
        for (const [id] of idToScrollPosition) {
          if (!currentPagesIds.has(id)) {
            idsForRemove.push(id);
          }
        }
        for (const id of idsForRemove) {
          idToScrollPosition.delete(id);
        }
      }

      document.documentElement.dataset.navigationDir =
        e.delta > 0 ? "forward" : "backward";

      const transition = startViewTransition();
      e._delay = transition.ready;

      lastViewTransitionFinish = transition.finished;

      lastViewTransitionFinish.finally(() => {
        if (lastViewTransitionFinish === transition.finished) {
          delete document.documentElement.dataset.navigationDir;
          lastViewTransitionFinish = null;
        }
      });
    }),
  );

  const originalOn = navigator.on;
  navigator.on = function (ev, callback) {
    return originalOn(ev, (e: ChangeEvent, ...rest) => {
      if (!e._delay) {
        // @ts-expect-error unions
        callback(e, ...rest);
        return;
      }
      e._delay.finally(() => {
        // @ts-expect-error unions
        callback(e, ...rest);

        // waiting for layout to scroll work properly
        queueMicrotask(() => {
          window.scrollTo({
            behavior: "instant",
            top: idToScrollPosition.get(e.to.id) ?? 0,
          });
        });
      });
    });
  };
};
