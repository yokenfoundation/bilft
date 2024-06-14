import { BottomDialog } from "@/features/BottomDialog";
import { fetchMethodCurry, keysFactory, getWalletError } from "@/api/api";
import type model from "@/api/model";
import { clsxString, utils, type StyleProps } from "@/common";
import { ArrowPointDownIcon, UnlinkIcon, CloseIcon, YoCoinIcon, ArrowUpIcon } from "@/icons";
import { useTonConnectUI } from "@/lib/ton-connect-solid";
import { useQueryClient, createMutation, createQuery } from "@tanstack/solid-query";
import { postEvent } from "@tma.js/sdk";
import { AxiosError } from "axios";
import { createSignal, createEffect, Show, batch, Switch, Match, type ComponentProps } from "solid-js";
import { disconnectWallet, walletLinkedTarget } from "./SetupTonWallet";
import { LoadingSvg } from "./LoadingSvg";
import { createTransitionPresence, mergeRefs, useCleanup } from "@/lib/solid";

const buttonClass =
  "transition-transform duration-200 active:scale-[98%] bg-accent p-[12px] font-inter text-[17px] leading-[22px] text-button-text text-center rounded-xl self-stretch";

const YOKEN_DECIMALS = 9;

const yokenAmountToFloat = (amount: string) => Number(amount) / 10 ** YOKEN_DECIMALS;
const trimAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

const CheckboxUI = () => (
  <div class="w-5 isolate flex items-center justify-center aspect-square border-accent border-[1.5px] rounded-md relative">
    <div class="absolute -z-10 inset-0 bg-accent group-[[data-checked]]:opacity-100 opacity-0 transition-opacity" />
    <svg
      class="text-white transition-opacity opacity-0 group-[[data-checked]]:opacity-100"
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 3.99992L3.58 6.82992L9.25 1.16992"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
);

function PostInput(
  props: StyleProps & {
    value: string;
    onChange: (s: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isAnonymous: boolean;
    setIsAnonymous: (status: boolean) => void;
  },
) {
  let inputRef!: HTMLTextAreaElement | undefined;
  const isEmpty = () => props.value.length === 0;

  return (
    <form
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          inputRef?.focus();
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onSubmit();
      }}
      class={clsxString(
        "p-4 bg-section-bg border-[#AAA] border mx-4 border-opacity-15 rounded-[20px] flex flex-col gap-[10px] items-stretch overflow-hidden cursor-text justify-between",
        props.class ?? "",
      )}
    >
      <div
        class='flex-1 grid grid-cols-1 [&>textarea]:[grid-area:1/1/2/2] after:[grid-area:1/1/2/2] font-inter text-[16px] leading-[21px] after:font-[inherit] after:invisible after:whitespace-pre-wrap after:break-words after:content-[attr(data-value)_"_"]'
        data-value={props.value}
      >
        <textarea
          placeholder="Text me here..."
          rows={1}
          value={props.value}
          onInput={(e) => {
            props.onChange(e.target.value);
          }}
          inert={props.isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey && props.value.length > 0) {
              e.preventDefault();
              props.onSubmit();
            }
          }}
          ref={inputRef}
          class="bg-transparent w-full placeholder:select-none overflow-hidden break-words max-w-full resize-none border-none focus:border-none focus:outline-none"
        />
      </div>
      <div class="bg-gray-300/50 w-full h-[1px]" />
      <div class="flex flex-row justify-between items-center p-[2px]">
        <label
          class="group select-none flex flex-row items-center cursor-pointer"
          data-checked={props.isAnonymous ? "" : undefined}
        >
          <input
            onChange={(e) => {
              props.setIsAnonymous(e.target.checked);
            }}
            checked={props.isAnonymous}
            type="checkbox"
            class="invisible w-0 h-0"
          />
          <CheckboxUI />

          <div class="ml-2 font-inter text-subtitle text-[16px] leading-[22px]">Send anonymously</div>
        </label>
        <button
          disabled={isEmpty() || props.isLoading}
          class="relative ml-auto mt-auto w-7 aspect-square flex items-center justify-center [&>svg>path]:fill-accent [&:disabled>svg>path]:fill-gray-400  rounded-full overflow-hidden"
        >
          <Show fallback={<ArrowUpIcon />} when={props.isLoading}>
            <div role="status">
              <LoadingSvg class="text-gray-600 w-7 fill-gray-300" />
              <span class="sr-only">Loading...</span>
            </div>
          </Show>
        </button>
      </div>
    </form>
  );
}

const WalletControlPopup = (
  props: StyleProps & { address: string; onUnlink(): void } & Pick<ComponentProps<"div">, "ref">,
) => {
  const [show, setShow] = createSignal(false);
  const [divRef, setDivRef] = createSignal<HTMLDivElement>();

  createEffect(() => {
    if (!show()) {
      return;
    }

    useCleanup((signal) => {
      window.addEventListener(
        "click",
        (ev) => {
          if (ev.target instanceof HTMLElement && !divRef()?.contains(ev.target)) {
            setShow(false);
            ev.preventDefault();
            ev.stopPropagation();
          }
        },
        {
          signal,
          capture: true,
        },
      );
    });
  });

  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement>();

  const { present, status } = createTransitionPresence({
    element: buttonRef,
    when: show,
  });

  return (
    <div
      ref={mergeRefs(setDivRef, props.ref)}
      class={clsxString(
        "absolute select-none left-1/2 translate-x-[-50%] flex flex-col gap-[10px] items-center",
        props.class ?? "",
      )}
    >
      <button
        onClick={() => {
          setShow((curShow) => !curShow);
        }}
        class="flex gap-1 transition-transform active:scale-[97%] flex-row font-inter text-[12px] bg-bg text-text items-center px-[10px] py-[6px] rounded-[10px]"
      >
        {/* convert on backend to userfriendly */}
        {trimAddress(props.address)}
        <ArrowPointDownIcon />
      </button>

      <Show when={present()}>
        <button
          ref={setButtonRef}
          onPointerDown={() => {
            postEvent("web_app_trigger_haptic_feedback", {
              type: "impact",
              impact_style: "heavy",
            });
          }}
          onClick={() => {
            setShow(false);
            props.onUnlink();
          }}
          class={clsxString(
            "text-destructive-text absolute top-[calc(100%+10px)] transition-transform -mx-[40px]",
            "bg-section-bg font-inter text-[15px] leading-[18px] text-center px-2 py-[10px] flex flex-row gap-1 rounded-xl active:scale-[97%] animate-duration-300",
            status() === "hiding" ? "animate-fade-out" : "animate-fade",
          )}
        >
          Unlink wallet
          <UnlinkIcon />
        </button>
      </Show>
    </div>
  );
};

const ModalContent = (props: {
  walletError: model.WalletError;
  onClose(): void;
  onUnlinkWallet(): void;
  onSendPublic(): void;
}) => {
  const walletError = () => props.walletError;
  const meQuery = createQuery(() => keysFactory.me);

  const [tonConnectUI] = useTonConnectUI();

  return (
    <div class="min-h-[432px] flex flex-col">
      <section class="pt-5 pb-3 relative flex items-center justify-end">
        <Show when={meQuery.data?.wallet}>
          {(wallet) => (
            <WalletControlPopup
              onUnlink={() => {
                props.onUnlinkWallet();
              }}
              address={wallet().address}
            />
          )}
        </Show>

        <button
          onClick={() => {
            props.onClose();
          }}
          type="button"
        >
          <span class="sr-only">Close</span>
          <CloseIcon class="text-accent" />
        </button>
      </section>

      <section class="mt-5 flex flex-col flex-1 items-center">
        <YoCoinIcon class="mb-6" />

        <p
          data-checked=""
          class="group flex gap-2 items-center font-inter font-semibold text-[20px] leading-7 text-center text-text"
        >
          <CheckboxUI />
          Send anonymously
        </p>
        <p class="text-hint font-inter text-[17px] leading-[22px] text-center mt-2">
          To ask a question, you need{" "}
          <span class="text-text">
            {yokenAmountToFloat(walletError().error.payload.requiredBalance).toFixed(0)} Yo Tokens.
          </span>
          <Show when={walletError().error.reason === "insufficient_balance"}>
            <br /> Please top up your balance.
          </Show>
        </p>

        <Switch>
          <Match when={walletError().error.reason === "insufficient_balance"}>
            <article class="flex flex-row gap-1 mt-5 mb-auto">
              <div class="flex flex-col px-[10px] py-[6px] bg-section-bg rounded-[10px]">
                <div class="text-subtitle font-inter text-[12px] leading-4">Your balance</div>
                <div class="text-[#30D158] font-inter text-[13px] leading-[18px]">
                  {yokenAmountToFloat(meQuery.data?.wallet?.tokens.yo ?? "0").toFixed(0)} Yo
                </div>
              </div>

              <div class="flex flex-col px-[10px] py-[6px] bg-section-bg rounded-[10px]">
                <div class="text-subtitle font-inter text-[12px] leading-4">lacks</div>
                <div class="text-text font-inter text-[13px] leading-[18px]">
                  {Math.ceil(
                    yokenAmountToFloat(walletError().error.payload.requiredBalance) -
                      yokenAmountToFloat(meQuery.data?.wallet?.tokens.yo ?? "0"),
                  )}{" "}
                  Yo
                </div>
              </div>
            </article>

            <button
              type="button"
              class={clsxString("mt-7 mb-4", buttonClass)}
              onClick={() => {
                utils.openLink("https://app.dedust.io/swap/TON/YO");
              }}
            >
              Top up
            </button>
          </Match>
          <Match when={walletError().error.reason === "no_connected_wallet"}>
            <div class="flex flex-col mt-7 flex-1 justify-center self-stretch">
              <button
                type="button"
                class={clsxString(buttonClass)}
                onClick={async () => {
                  const ton = tonConnectUI();
                  if (!ton) {
                    return;
                  }

                  await disconnectWallet(ton);
                  ton.modal.open();
                }}
              >
                Connect Wallet
              </button>
              <button
                type="button"
                class="pt-[14px] mb-2 active:opacity-70 transition-opacity text-center text-accent font-inter text-[17px] leading-[22px]"
                onClick={() => {
                  props.onSendPublic();
                }}
              >
                Ask not anonymously
              </button>
            </div>
          </Match>
        </Switch>
      </section>
    </div>
  );
};

export const PostCreator = (props: { boardId: string }) => {
  const queryClient = useQueryClient();

  const [inputValue, setInputValue] = createSignal("");
  const [isAnonymous, setIsAnonymous] = createSignal(false);
  const [walletError, setWalletError] = createSignal<model.WalletError | null>(null);
  const addNoteMutation = createMutation(() => ({
    mutationFn: fetchMethodCurry("/board/createNote"),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: keysFactory.notes({
          board: props.boardId,
        }).queryKey,
      });
    },
    onMutate: ({ type }) => {
      if (type === "public") {
        setWalletError(null);
      }
    },
    onSuccess: (note: model.Note) => {
      queryClient.setQueryData(
        keysFactory.notes({
          board: props.boardId,
        }).queryKey,
        (data) => {
          if (!data || !data.pages || data.pages.length < 1) {
            return data;
          }
          const firstPage = data.pages[0];

          return {
            pageParams: data.pageParams,
            pages: [
              {
                data: [note, ...firstPage.data],
                next: firstPage.next,
              },
              ...data.pages.slice(1),
            ],
          };
        },
      );

      batch(() => {
        setInputValue("");
        setIsAnonymous(false);
        setWalletError(null);
      });
    },
    onError: (error) => {
      if (!(error instanceof AxiosError) || !error.response) {
        return;
      }
      const walletError = getWalletError(error.response);
      if (!walletError) {
        return;
      }
      try {
        setWalletError(walletError);
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  }));

  const unlinkMutation = createMutation(() => ({
    mutationFn: fetchMethodCurry("/me/unlinkWallet"),
    onMutate: () => {
      const curWalletError = walletError();
      if (curWalletError) {
        setWalletError({
          error: {
            reason: "no_connected_wallet",
            payload: curWalletError.error.payload,
          },
        });
      }
      const curData = queryClient.getQueryData(keysFactory.me.queryKey);

      queryClient.setQueryData(keysFactory.me.queryKey, (data) => (data ? { ...data, wallet: undefined } : undefined));

      return {
        curWalletError,
        curData,
      };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(keysFactory.me.queryKey, ctx?.curData);
      if (!walletError()) {
        return;
      }
      setWalletError(ctx?.curWalletError ?? null);
    },
  }));

  useCleanup((signal) => {
    walletLinkedTarget.addEventListener(
      "wallet-linked",
      () => {
        if (walletError()) {
          addNoteMutation.mutate({
            board: props.boardId,
            content: inputValue(),
            type: isAnonymous() ? "public-anonymous" : "public",
          });
        }
      },
      {
        signal,
      },
    );
  });

    useCleanup((signal) => {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && walletError()?.error.reason === 'insufficient_balance')  {
          
        }
      })
    })
  createEffect(() => {
    if (walletError()?.error.reason !== "insufficient_balance") {
      return;
    }
    
  });

  return (
    <>
      <PostInput
        isAnonymous={isAnonymous()}
        setIsAnonymous={setIsAnonymous}
        class="mt-6"
        isLoading={addNoteMutation.isPending}
        onSubmit={() => {
          if (!inputValue) {
            return;
          }

          addNoteMutation.mutate({
            board: props.boardId,
            content: inputValue(),
            type: isAnonymous() ? "public-anonymous" : "public",
          });
        }}
        value={inputValue()}
        onChange={setInputValue}
      />
      <BottomDialog
        onClose={() => {
          setWalletError(null);
        }}
        when={walletError()}
      >
        {(walletError) => (
          <ModalContent
            walletError={walletError()}
            onClose={() => {
              setWalletError(null);
            }}
            onUnlinkWallet={() => {
              unlinkMutation.mutate();
            }}
            onSendPublic={() => {
              addNoteMutation.mutate({
                board: props.boardId,
                type: "public",
                content: inputValue(),
              });
            }}
          />
        )}
      </BottomDialog>
    </>
  );
};
