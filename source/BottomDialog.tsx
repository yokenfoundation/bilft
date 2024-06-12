import { useNavigate, useSearchParams } from "@solidjs/router";
import {
  type Accessor,
  type JSX,
  createSignal,
  createMemo,
  untrack,
  createEffect,
  Show,
  startTransition,
} from "solid-js";
import { type StyleProps, createDisposeEffect } from "./common";
import { Portal } from "solid-js/web";

function asserkOk(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is not ok");
  }
}

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
  let dialogRef!: HTMLDivElement | undefined;

  const [modalStatus, setModalStatus] = createSignal<"hidden" | "shown" | "closing">(props.when ? "shown" : "hidden");
  const show = createMemo(() => !!props.when);

  const whenOrPrev = createMemo<T | undefined | null | false>((prev) =>
    modalStatus() === "hidden" ? null : modalStatus() === "shown" && props.when ? props.when : prev,
  );

  useModalNavigation({
    onClose: () => props.onClose(),
    show: () => modalStatus() !== "hidden",
  });

  createDisposeEffect(() => {
    if (!show() || untrack(() => modalStatus() === "closing")) {
      modalStatus();
      return;
    }

    const curOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = "clip";

    const animationPromise = startTransition(() => setModalStatus("shown"))
      .then(raf)
      .then(() => {
        requestAnimationFrame(() => {
          asserkOk(dialogRef);
          dialogRef.style.setProperty("--opacity", "1");
          dialogRef.style.setProperty("--translateY", "0%");
        });
      });

    const abortController = new AbortController();
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") {
          props.onClose();
        }
      },
      {
        signal: abortController.signal,
      },
    );

    return () => {
      abortController.abort();
      const dismiss = () => {
        document.body.style.overflowY = curOverflowY;
        setModalStatus("hidden");
      };

      if (!dialogRef) {
        dismiss();
        return;
      }

      animationPromise.then(() => {
        dialogRef.children.item(1)!.addEventListener("transitionend", dismiss, {
          once: true,
        });

        dialogRef.style.setProperty("--opacity", "0");
        dialogRef.style.setProperty("--translateY", "100%");
      });
      setModalStatus("closing");
    };
  });

  return (
    <>
      <Show when={whenOrPrev()}>
        {(data) => (
          <Portal>
            <div ref={dialogRef} class="z-50 flex flex-col fixed inset-0">
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
    </>
  );
};
