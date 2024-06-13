import { useNavigate, useSearchParams } from "@solidjs/router";
import { type Accessor, type JSX, createSignal, createMemo, untrack, createEffect, Show, onCleanup } from "solid-js";
import { type StyleProps } from "../common";
import { Portal } from "solid-js/web";
import { createDisposeEffect, createTransitionPresence, useCleanup } from "@/lib/solid";

const useModalNavigation = ({ onClose, show: _show }: { onClose(): void; show: Accessor<boolean> }) => {
  const show = createMemo(_show);

  const [params, setParams] = useSearchParams<{
    modals?: string;
  }>();
  const navigate = useNavigate();

  let isSet = false;
  createDisposeEffect(() => {
    if (!show()) {
      return;
    }

    const id = Math.random().toString(16).slice(2);
    untrack(() => {
      setParams(
        {
          ...params,
          modals: params.modals ? `${params.modals}.${id}` : id,
        },
        {
          replace: false,
        },
      );
    });
    isSet = false;

    createEffect(() => {
      // expensive operation, but not a big deal
      const includesId = params.modals?.split(".").includes(id);
      if (includesId) {
        isSet = true;
        return;
      }
      if (!isSet) {
        return;
      }
      onClose();
      isSet = false;
    });

    return () => {
      if (isSet) {
        navigate(-1);
      }
    };
  });
};

const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));

export const BottomDialog = <T,>(
  props: StyleProps & {
    when: T | undefined | null | false;
    onClose(): void;
    children: (accessor: Accessor<NoInfer<T>>) => JSX.Element;
  },
) => {
  const [dialogRef, setDialogRef] = createSignal<HTMLDialogElement>();

  const transitionPresence = createTransitionPresence({
    when: () => props.when,
    element: dialogRef,
  });
  useModalNavigation({
    onClose: () => props.onClose(),
    show: () => transitionPresence.status() !== "hidden",
  });

  createEffect(() => {
    if (!transitionPresence.present()) {
      return;
    }

    const curOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = "clip";
    onCleanup(() => {
      document.body.style.overflowY = curOverflowY;
    });

    useCleanup((signal) => {
      window.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Escape") {
            props.onClose();
          }
        },
        {
          signal,
        },
      );
    });
  });

  return (
    <Show when={transitionPresence.present()}>
      {(data) => (
        <Portal>
          <div
            style={
              transitionPresence.status() === "hiding" || transitionPresence.status() === "presenting"
                ? {
                    "--opacity": 0,
                    "--translateY": "100%",
                  }
                : {
                    "--opacity": 1,
                    "--translateY": "0%",
                  }
            }
            ref={setDialogRef}
            class="z-50 flex flex-col fixed inset-0"
          >
            <button
              class="bg-black/60 absolute inset-0 transition-opacity duration-300 opacity-[var(--opacity,0)]"
              onClick={() => {
                props.onClose();
              }}
            />
            <div class="transition-transform translate-y-[var(--translateY,100%)] duration-300 px-4 mt-auto bg-secondary-bg rounded-t-[30px]">
              {props.children(data)}
            </div>
          </div>
          {/* <dialog
            onCancel={(e) => {
              e.preventDefault();
              props.onClose();
            }}
            ref={dialogRef}
            class="backdrop:opacity-[var(--opacity,0)] transition-transform backdrop:transition-opacity duration-300 translate-y-[var(--translateY,100%)] w-screen mx-0 bg-secondary-bg max-w-[9999999px] mb-0 px-4 outline-none backdrop:bg-black/30 rounded-t-[30px]"
          >
            {props.children(data)}
          </dialog> */}
        </Portal>
      )}
    </Show>
  );
};
