import type { TonConnectUI, TonConnectOptions, WalletsModal, TonConnectUiOptions } from "@tonconnect/ui";
import {
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  useContext,
  type Accessor,
  type ParentProps,
  type Setter,
} from "solid-js";
import { fetchMethodCurry } from "./api/api";
import { createDisposeEffect } from "./common";

const random32Byte = () => {
  const buf = Buffer.alloc(32);
  crypto.getRandomValues(buf);

  return buf.toString("hex");
};

const TonContext = createContext<null | (() => TonConnectUI | null)>(null);

const useTonContext = () => {
  const ctx = useContext(TonContext);

  if (!ctx) {
    throw new Error("TonContext not found");
  }

  return ctx;
};

export const useTonConnectModal = (): [
  Accessor<WalletsModal["state"] | null>,
  Pick<WalletsModal, "open" | "close">,
] => {
  const [tonConnectUI] = useTonConnectUI();
  const [state, setState] = createSignal(tonConnectUI()?.modal.state ?? null);

  createDisposeEffect(() =>
    tonConnectUI()?.onModalStateChange((ev) => {
      setState(ev);
    }),
  );

  return [
    state,
    {
      open: () => tonConnectUI()?.modal.open(),
      close: () => tonConnectUI()?.modal.close(),
    },
  ];
};

export const useTonWallet = (): Accessor<TonConnectUI["wallet"]> => {
  const ctx = useTonContext();

  const [wallet, setWallet] = createSignal(ctx()?.wallet ?? null);

  createDisposeEffect(() => {
    const tonConnectUI = ctx();
    if (!tonConnectUI) {
      return;
    }
    setWallet(tonConnectUI.wallet);

    return tonConnectUI?.onStatusChange((newState) => {
      setWallet(newState);
    });
  });

  return wallet;
};

export const useTonConnectUI = (): [Accessor<TonConnectUI | null>, Setter<TonConnectUiOptions>] => {
  const ctx = useTonContext();

  return [
    ctx,
    (data) => {
      const tonConnectUI = ctx();
      if (!tonConnectUI) {
        throw new Error("Cannot set props of unexisting ConnectUI");
      }

      tonConnectUI.uiOptions = typeof data === "function" ? data(tonConnectUI.uiOptions) : data;

      return tonConnectUI.uiOptions;
    },
  ];
};

export const TonConnectProvider = (
  props: ParentProps<{
    manifestUrl: string;
  }>,
) => {
  const [tonConnectModuleResource] = createResource(() => import("@tonconnect/ui"));

  const tonConnectUI = createMemo(() => {
    if (!tonConnectModuleResource.latest) {
      return null;
    }

    const ui = new tonConnectModuleResource.latest.TonConnectUI({
      manifestUrl: props.manifestUrl,
    });

    return ui;
  });

  // application specific logic
  createEffect(() => {
    tonConnectUI()?.setConnectRequestParameters({
      state: "ready",
      value: { tonProof: random32Byte() },
    });
  });

  createDisposeEffect(() =>
    tonConnectUI()?.onStatusChange((e) => {
      if (e?.connectItems?.tonProof && "proof" in e.connectItems.tonProof && e.account.publicKey) {
        console.log("get wallet connection proof");

        fetchMethodCurry("/me/linkWallet")({
          address: e.account.address,
          proof: e.connectItems.tonProof.proof,
          publicKey: e.account.publicKey,
          stateInit: e.account.walletStateInit,
        })
          .then((info) => {
            console.log("connected", info);
          })
          .catch((err) => {
            console.error("connection failed", err);
          });
      }
    }),
  );

  return <TonContext.Provider value={tonConnectUI}>{props.children}</TonContext.Provider>;
};
