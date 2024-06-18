import { BottomDialog } from "@/features/BottomDialog";
import { fetchMethodCurry, keysFactory, getWalletError } from "@/api/api";
import type model from "@/api/model";
import { clsxString, platform, utils, type StyleProps } from "@/common";
import {
  ArrowPointDownIcon,
  UnlinkIcon,
  CloseIcon,
  YoCoinIcon,
  ArrowUpIcon,
  RefreshIcon,
  SuccessIcon,
} from "@/icons";
import { useTonConnectUI } from "@/lib/ton-connect-solid";
import {
  useQueryClient,
  createMutation,
  createQuery,
} from "@tanstack/solid-query";
import { postEvent } from "@tma.js/sdk";
import { AxiosError } from "axios";
import {
  createSignal,
  createEffect,
  Show,
  batch,
  Switch,
  Match,
  type ComponentProps,
  createMemo,
  type Accessor,
} from "solid-js";
import { disconnectWallet, walletLinkedTarget } from "../SetupTonWallet";
import { LoadingSvg } from "../LoadingSvg";
import {
  SignalHelper,
  createTransitionPresence,
  mergeRefs,
  useCleanup,
} from "@/lib/solid";

const buttonClass =
  "transition-transform duration-200 active:scale-[98%] bg-accent p-[12px] font-inter text-[17px] leading-[22px] text-button-text text-center rounded-xl self-stretch";

const YOKEN_DECIMALS = 9;

const yokenAmountToFloat = (amount: string) =>
  Number(amount) / 10 ** YOKEN_DECIMALS;
const trimAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;

const CheckboxUI = () => (
  <div class="w-5 isolate flex items-center justify-center aspect-square border-accent border-[1.5px] rounded-md relative">
    <div class="absolute -z-10 inset-0 bg-accent group-[[data-checked]]:opacity-100 opacity-0 rounded-[3px] transition-opacity" />
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

// [TODO]: share number with backend

const MAX_POST_LENGTH = 1200;
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
  let formRef!: HTMLFormElement | undefined;
  const trimmedText = createMemo(() => props.value.trim());
  const isEmpty = () => trimmedText().length === 0;
  const symbolsRemaining = () => MAX_POST_LENGTH - trimmedText().length;
  const [isFocused, setIsFocused] = createSignal(false);

  if (platform === "ios") {
    createEffect(() => {
      if (!isFocused()) {
        return;
      }

      useCleanup((signal) => {
        window.addEventListener(
          "scroll",
          (e) => {
            if (
              inputRef &&
              e.target &&
              (e.target instanceof Element || e.target instanceof Document) &&
              !formRef?.contains(e.target)
            ) {
              const curInputMode = inputRef.inputMode;
              inputRef.inputMode = "none";
              setTimeout(() => {
                inputRef.inputMode = curInputMode;
              });
            }
          },
          {
            passive: true,
            signal,
            capture: true,
          },
        );
      });
    });
  }

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
      ref={formRef}
      class={clsxString(
        "p-4 bg-section-bg border-[#AAA] border mx-4 border-opacity-15 rounded-[20px] flex flex-col gap-[10px] items-stretch overflow-hidden cursor-text justify-between",
        props.class ?? "",
      )}
    >
      <div
        class='flex-1 grid grid-cols-1 [&>textarea]:[grid-area:1/1/2/2] after:[grid-area:1/1/2/2] font-inter text-[16px] leading-[21px] after:font-[inherit] after:invisible after:whitespace-pre-wrap after:break-words after:content-[attr(data-value)_"_"] max-h-[40vh] overflow-auto'
        data-value={props.value}
      >
        <textarea
          placeholder="Text me here..."
          rows={1}
          value={props.value}
          onInput={(e) => {
            props.onChange(e.target.value);
          }}
          onFocus={() => {
            console.log("onfocus");
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
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
      <div class="bg-separator w-full h-separator" />
      <div class="flex flex-row items-center p-[2px]">
        <label
          class="group select-none flex flex-row items-center cursor-pointer mr-auto"
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

          <div class="ml-2 font-inter text-subtitle text-[16px] leading-[22px]">
            Send anonymously
          </div>
        </label>

        <Show when={symbolsRemaining() < MAX_POST_LENGTH / 4}>
          <p
            class={clsxString(
              "ml-auto font-inter text-[16px] leading-[16px]",
              symbolsRemaining() > 0 ? "text-hint" : "text-destructive-text",
            )}
          >
            {symbolsRemaining()}
          </p>
        </Show>
        <button
          disabled={isEmpty() || props.isLoading || symbolsRemaining() <= 0}
          class="relative ml-2 w-7 aspect-square flex items-center justify-center [&>svg>path]:fill-accent [&:disabled>svg>path]:fill-gray-400  rounded-full overflow-hidden"
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


type ModalStatus =
  | {
      type: "error";
      data: model.WalletError;
    }
  | {
      type: "success";
      data: null;
    };

export const PostCreator = (props: { boardId: string }) => {
  const queryClient = useQueryClient();

  const [inputValue, setInputValue] = createSignal("");
  const [isAnonymous, setIsAnonymous] = createSignal(false);
  const [walletError, setWalletError] = createSignal<model.WalletError | null>(
    null,
  );
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

      queryClient.setQueryData(keysFactory.me.queryKey, (data) =>
        data ? { ...data, wallet: undefined } : undefined,
      );

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

  const meQuery = createQuery(() => keysFactory.me);

  const hasEnoughMoney = createMemo(() => {
    const curWalletError = walletError();
    const tokensBalance = meQuery.data?.wallet?.tokens.yo;
    if (!curWalletError || !tokensBalance) {
      return;
    }
    return (
      BigInt(curWalletError.error.payload.requiredBalance) <=
      BigInt(tokensBalance)
    );
  });

  const modalStatus = (): ModalStatus | null =>
    SignalHelper.map(walletError, (error) =>
      !error
        ? null
        : hasEnoughMoney()
          ? {
              type: "success",
              data: null,
            }
          : {
              type: "error",
              data: error,
            },
    );
  const sendContent = (anonymous: boolean) =>
    addNoteMutation.mutate({
      board: props.boardId,
      content: inputValue(),
      type: anonymous ? "public-anonymous" : "public",
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

          sendContent(isAnonymous());
        }}
        value={inputValue()}
        onChange={setInputValue}
      />
      <BottomDialog
        onClose={() => {
          setWalletError(null);
        }}
        when={modalStatus()}
      >
        {(status) => (
          <ModalContent
            onSend={() => {
              sendContent(isAnonymous());
              setWalletError(null);
            }}
            status={status()}
            onClose={() => {
              setWalletError(null);
            }}
            onUnlinkWallet={() => {
              unlinkMutation.mutate();
            }}
            onSendPublic={() => {
              sendContent(false);
            }}
          />
        )}
      </BottomDialog>
    </>
  );
};
