import { fetchMethodCurry, keysFactory } from "@/api/api";
import { createDisposeEffect } from "@/lib/solid";
import { useTonConnectUI } from "@/lib/ton-connect-solid";
import { useQueryClient, createMutation } from "@tanstack/solid-query";
import { createEffect } from "solid-js";

const random32Byte = () => {
  const buf = Buffer.alloc(32);
  crypto.getRandomValues(buf);

  return buf.toString("hex");
};

export const walletLinkedTarget = new EventTarget();

export const SetupTonWallet = () => {
  const [tonConnectUI] = useTonConnectUI();
  // application specific logic
  createEffect(() => {
    tonConnectUI()?.setConnectRequestParameters({
      state: "ready",
      value: { tonProof: random32Byte() },
    });
  });

  const queryClient = useQueryClient();
  const linkWalletMutation = createMutation(() => ({
    mutationFn: fetchMethodCurry("/me/linkWallet"),
    onSuccess: (data) => {
      walletLinkedTarget.dispatchEvent(new Event("wallet-linked"));
      queryClient.setQueryData(keysFactory.me.queryKey, data);
    },
    retry: 3,
  }));

  createDisposeEffect(() =>
    tonConnectUI()?.onStatusChange((e) => {
      if (e?.connectItems?.tonProof && "proof" in e.connectItems.tonProof && e.account.publicKey) {
        linkWalletMutation.mutate({
          address: e.account.address,
          proof: e.connectItems.tonProof.proof,
          publicKey: e.account.publicKey,
          stateInit: e.account.walletStateInit,
        });
      }
    }),
  );

  return null;
};
