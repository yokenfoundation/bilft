import { type ParentProps, createComputed, createMemo, createSignal, For, Match, Show, Switch, type ComponentProps, createUniqueId, createEffect } from "solid-js";
import {
  addPrefix,
  clsxString,
  getSelfUserId,
  isEqualIds,
  removePrefix,
  type DateString,
  type StyleProps,
} from "./common";
import { createInfiniteQuery, createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { fetchMethodCurry, keysFactory } from "./api/api";
import type model from "./api/model";
import { infiniteQueryOptionsWithoutDataTag } from "./queryClientTypes";
import { A, useParams } from "@solidjs/router";
import { TonConnectUI, type EventDispatcher } from '@tonconnect/ui'

const getCleanUrl = () => {
  const url = new URL(window.location.href)
  url.hash = ''
  for (const [key] of url.searchParams) {
    url.searchParams.delete(key)
  }

  return url
}

const random32Byte = () => {
  const buf = Buffer.alloc(4)
  crypto.getRandomValues(buf)

  return buf.toString('hex')
}

const TonButton = (props: ComponentProps<'button'>) => {
  const _id = createUniqueId()
  const id = () => props.id ?? _id;
  const consoleEventDispatcher: EventDispatcher<any> = {
    dispatchEvent: ((name, data) => {
      console.log(`Event: ${name}, details: `, data)
    }) as EventDispatcher<any>['dispatchEvent'],
    addEventListener: () => Promise.resolve(() => { })
  }

  createEffect<() => void>((prevDispose) => {
    if (prevDispose) {
      prevDispose()
    }
    const url = getCleanUrl()
    url.pathname = 'tonconnect-manifest.json'


    const tonConnectUI = new TonConnectUI({
      manifestUrl: url.toString(),
      buttonRootId: id(),
      eventDispatcher: consoleEventDispatcher
    })


    tonConnectUI.setConnectRequestParameters({
      state: 'ready',
      value: {
        tonProof: random32Byte()
      }
    })

    const dispose = tonConnectUI.onStatusChange(e => {
      console.log('tonConnectUI', e)

      if (e?.connectItems?.tonProof && 'proof' in e.connectItems.tonProof) {
        console.log('tonProof', e.connectItems.tonProof)

        fetchMethodCurry('/me/linkWallet')({
          address: e.account.address,
          network: e.account.chain as "-239" | "-1",
          proof: {
            ...e.connectItems.tonProof.proof,
            state_init: e.account.walletStateInit
          }
        })
      }
    })

    return () => dispose()
  })

  return <button {...props} id={id()}>{props.children}</button>
}

const UserStatus = (props: ParentProps<StyleProps>) => (
  <article class={clsxString("relative flex flex-col", props.class ?? "")}>
    <svg
      class="absolute text-accent left-0 top-0"
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0.04006C4.46481 4.16015 5.65964 5.81985 5.65964 19.9819C20.3365 16.2557 21.9956 13.836 19.8257 7.41852C11.0669 2.45015 2.95905 -0.37397 0 0.04006Z"
        fill="currentColor"
      />
    </svg>
    <div class="px-4 py-2 self-start rounded-3xl ml-1 bg-accent min-h-[38px]">{props.children}</div>
  </article>
);

const LoadingSvg = (props: StyleProps) => (
  <svg
    aria-hidden="true"
    class={clsxString("inline aspect-square animate-spin", props.class ?? "")}
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
);

function PostInput(
  props: StyleProps & { value: string; onChange: (s: string) => void; onSubmit: () => void; isLoading: boolean },
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
        "p-4 bg-section-bg border-[#AAA] border mx-4 border-opacity-15 rounded-[20px] flex flex-row gap-[10px] items-center overflow-hidden cursor-text justify-between",
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
      <button
        disabled={isEmpty() || props.isLoading}
        class="relative mt-auto w-7 aspect-square flex items-center justify-center [&>svg>path]:fill-accent [&:disabled>svg>path]:fill-gray-400  rounded-full overflow-hidden"
      >
        <Show
          fallback={
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28ZM14.6498 7.37729C14.48 7.20016 14.2453 7.1 14 7.1C13.7547 7.1 13.52 7.20016 13.3502 7.37729L8.35021 12.5947C8.00629 12.9535 8.01842 13.5233 8.37729 13.8672C8.73615 14.2111 9.30587 14.199 9.64979 13.8401L13.1 10.2399V20C13.1 20.4971 13.5029 20.9 14 20.9C14.4971 20.9 14.9 20.4971 14.9 20V10.2399L18.3502 13.8401C18.6941 14.199 19.2638 14.2111 19.6227 13.8672C19.9816 13.5233 19.9937 12.9535 19.6498 12.5947L14.6498 7.37729Z"
                class="transition-[fill]"
              />
            </svg>
          }
          when={props.isLoading}
        >
          <div role="status">
            <LoadingSvg class="text-gray-600 w-7 fill-gray-300" />
            <span class="sr-only">Loading...</span>
          </div>
        </Show>
      </button>
    </form>
  );
}

const formatPostDate = (createdAt: DateString) =>
  new Date(createdAt).toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

const formatPostTime = (createdAt: DateString) =>
  new Date(createdAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

function BoardNote(
  props: ParentProps<
    StyleProps & {
      name: string;
      createdAt: DateString;
      avatarUrl: string | null;
      authorId: string;
      onClick?: (e: MouseEvent) => void;
    }
  >,
) {
  return (
    <article
      class={clsxString(
        "mx-4 bg-section-bg px-[14px] pb-4 pt-[14px] rounded-3xl flex flex-col transition-transform has-[a:active]:scale-[0.98]",
        props.class ?? "",
      )}
    >
      <A href={`/board/${props.authorId}`} onClick={props.onClick} class="flex gap-[10px] items-center">
        <AvatarIcon lazy isLoading={false} url={props.avatarUrl} class="w-10" />
        <div class="flex flex-col">
          <div class="font-inter font-medium text-[17px] leading-[22px]">{props.name}</div>
          <div class="font-inter text-[13px] leading-4 text-subtitle">
            posted {formatPostDate(props.createdAt)} at {formatPostTime(props.createdAt)}
          </div>
        </div>
      </A>

      <div class="mx-[2px] my-[10px] bg-gray-300/50 h-[1px]" />

      <div class="whitespace-pre-wrap font-inter text-[16px] leading-[21px]">{props.children}</div>
    </article>
  );
}

const isImageAlreadyLoaded = (imageSrc: string) => {
  const img = document.createElement("img");
  img.src = imageSrc;

  return img.complete;
};

const AvatarIcon = (props: StyleProps & { isLoading: boolean; url: string | null; lazy?: boolean }) => {
  const [isImageLoaded, setIsImageLoaded] = createSignal(props.url ? isImageAlreadyLoaded(props.url) : false);

  createComputed((prev) => {
    if (props.url && props.url !== prev) {
      setIsImageLoaded(isImageAlreadyLoaded(props.url));
    }

    return props.url;
  });

  const isLoading = () => props.isLoading && !isImageLoaded();

  return (
    <div class={clsxString("aspect-square rounded-full overflow-hidden relative select-none", props.class ?? "")}>
      <div
        class={clsxString(
          "absolute inset-0 bg-gray-400 transition-opacity",
          isLoading() ? "animate-pulse" : props.url ? "opacity-0" : "",
        )}
      />
      <Show when={props.url}>
        {(url) => (
          <img
            loading={props.lazy ? "lazy" : "eager"}
            onLoadStart={() => {
              setIsImageLoaded(false);
            }}
            onLoad={() => {
              setIsImageLoaded(true);
            }}
            alt="Avatar"
            src={url()}
            class={clsxString("object-cover inset-0", isLoading() ? "opacity-0" : "")}
          />
        )}
      </Show>
    </div>
  );
};

const UserProfilePage = (props: { isSelf: boolean; idWithoutPrefix: string }) => {
  const boardQuery = createQuery(() =>
    keysFactory.board({
      value: addPrefix(props.idWithoutPrefix),
    })(),
  );

  const getBoardId = () => removePrefix(props.idWithoutPrefix);

  const notesQuery = createInfiniteQuery(() =>
  ({
    ...infiniteQueryOptionsWithoutDataTag(
      // @ts-expect-error
      keysFactory.notes({
        board: getBoardId(),
      }),
    ),
    reconcile: 'id'
  }),
  );
  const notes = createMemo(() => (notesQuery.isSuccess ? notesQuery.data.pages.flatMap((it) => it.data) : []));

  const queryClient = useQueryClient();

  const [inputValue, setInputValue] = createSignal("");
  const addNoteMutation = createMutation(() => ({
    mutationFn: fetchMethodCurry("/board/createNote"),
    onSettled: () => {
      notesQuery.refetch();
    },
    onSuccess: (note: model.Note) => {
      queryClient.setQueryData(
        keysFactory.notes({
          board: getBoardId(),
        }).queryKey,
        (data) => {
          if (!data || data.pages.length < 1) {
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
      setInputValue("");
    },
  }));

  return (
    <main class="pb-6 pt-4 flex flex-col text-text min-h-screen">
      <TonButton />
      <section class="sticky bg-secondary-bg z-10 top-0 px-6 py-2 flex flex-row gap-5 items-center">
        <AvatarIcon class="w-12" isLoading={boardQuery.isLoading} url={boardQuery.data?.profile?.photo ?? null} />
        <div class="flex flex-col flex-1">
          <p class="font-bold font-inter text-[20px] leading-6 relative">
            {boardQuery.data?.profile?.title ?? boardQuery.data?.name ?? " "}
            <Show when={boardQuery.isLoading}>
              <div class="rounded-xl animate-pulse absolute left-0 right-[50%] inset-y-1 bg-gray-600" />
            </Show>
          </p>
          {/* TODO: add date */}
          {/* <p class="text-[15px] font-inter leading-[22px]">Member since Jan 2021</p> */}
        </div>
      </section>

      <UserStatus class="mt-2 mx-4 text-text">
        {boardQuery.isLoading ? "Loading..." : boardQuery.data?.profile?.description}
      </UserStatus>
      <PostInput
        class="mt-6"
        isLoading={addNoteMutation.isPending}
        onSubmit={() => {
          if (!inputValue) {
            return;
          }

          addNoteMutation.mutate({
            board: getBoardId(),
            content: inputValue(),
          });
        }}
        value={inputValue()}
        onChange={setInputValue}
      />

      <section class="flex mt-6 flex-col flex-1">
        <Switch>
          <Match when={notesQuery.isLoading}>
            <div class="flex flex-1 w-full items-center justify-center">
              <LoadingSvg class="fill-accent w-8 text-transparent" />
            </div>
          </Match>
          <Match when={notes().length === 0}>
            <div class="p-8 flex flex-col items-center">
              <img src="/assets/empty-notes.webp" class="w-32 aspect-square" alt="Questioning banana" />
              <strong class="font-inter text-center font-medium text-[20px] leading-[25px] mt-6">
                It's still empty
              </strong>
              <p class="text-subtitle font-inter text-center text-[17px] leading-[22px]">Be the first to post here!</p>
            </div>
          </Match>
          <Match when={notes().length > 0}>
            <For each={notes()}>
              {(note) => (
                <BoardNote
                  class="mb-4"
                  authorId={note.author.id}
                  createdAt={note.createdAt}
                  avatarUrl={note.author.photo}
                  name={note.author.name}
                  onClick={(e) => {
                    if (note.author.id === props.idWithoutPrefix) {
                      e.preventDefault();
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  {note.content}
                </BoardNote>
              )}
            </For>

            {notesQuery.isFetchingNextPage ? (
              <div role="status" class="mx-auto mt-6">
                <LoadingSvg class="fill-accent w-8 text-transparent" />
                <span class="sr-only">Next boards is loading</span>
              </div>
            ) : notes().length >= 8 ? (
              <button
                onClick={() => {
                  window.scrollTo({
                    behavior: "smooth",
                    top: 0,
                  });
                }}
                class="font-inter flex items-center gap-x-2 mt-6 text-[17px] active:opacity-70 transition-opacity leading-[22px] mx-auto text-accent"
              >
                Back to top
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 10L8 5L13 10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </Match>
        </Switch>
      </section>
    </main>
  );
};

export const ProfilePage = () => {
  const selfUserId = getSelfUserId().toString();
  const params = useParams();
  const idWithoutPrefix = () => params.idWithoutPrefix;

  return <UserProfilePage idWithoutPrefix={idWithoutPrefix()} isSelf={isEqualIds(selfUserId, idWithoutPrefix())} />;
};
