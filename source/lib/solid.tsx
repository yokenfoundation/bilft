import { createEffect, onCleanup } from "solid-js";

export type Dispose = () => void;
export const createDisposeEffect = (effect: () => Dispose | void) =>
  createEffect((prevDispose: void | Dispose) => {
    if (prevDispose) {
      prevDispose();
    }

    return effect();
  });

export const useCleanup = (callback: (signal: AbortSignal) => void) => {
  const abortController = new AbortController();

  callback(abortController.signal);

  onCleanup(() => {
    abortController.abort;
  });
};
