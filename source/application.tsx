import { type PropsWithChildren, createComputed, createMemo, createSignal, For, onMount } from "solid-js";
import WebApp from "@twa-dev/sdk";
import { clsxString, getBoardId, getProfileId, type DateString, type StyleProps } from "./common";
import { createInfiniteQuery, createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { fetchMethodCurry, keysFactory } from "./api/api";
import type model from "./api/model";
import { infiniteQueryOptionsWithoutDataTag } from "./queryClientTypes";

const UserStatus = (props: PropsWithChildren<StyleProps>) => (
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

function PostInput(props: { value: string; onChange: (s: string) => void; onSubmit: () => void; isLoading: boolean }) {
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
      class="mt-4 p-4 bg-[#AAA] bg-opacity-[8%] border-[#AAA] border mx-4 border-opacity-15 rounded-3xl flex flex-row gap-[10px] items-center overflow-hidden cursor-text justify-between"
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
          ref={inputRef}
          class="bg-transparent overflow-hidden break-words max-w-full resize-none border-none focus:border-none focus:outline-none"
        />
      </div>
      <button
        disabled={isEmpty() || props.isLoading}
        class="relative mt-auto w-7 aspect-square flex items-center justify-center [&>svg>path]:fill-[#FF375F] [&:disabled>svg>path]:fill-[#AAAAAA33] rounded-full overflow-hidden"
      >
        {props.isLoading ? (
          <div role="status">
            <LoadingSvg class="text-gray-600 w-7 fill-gray-300" />
            <span class="sr-only">Loading...</span>
          </div>
        ) : (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28ZM14.6498 7.37729C14.48 7.20016 14.2453 7.1 14 7.1C13.7547 7.1 13.52 7.20016 13.3502 7.37729L8.35021 12.5947C8.00629 12.9535 8.01842 13.5233 8.37729 13.8672C8.73615 14.2111 9.30587 14.199 9.64979 13.8401L13.1 10.2399V20C13.1 20.4971 13.5029 20.9 14 20.9C14.4971 20.9 14.9 20.4971 14.9 20V10.2399L18.3502 13.8401C18.6941 14.199 19.2638 14.2111 19.6227 13.8672C19.9816 13.5233 19.9937 12.9535 19.6498 12.5947L14.6498 7.37729Z"
              class="transition-[fill]"
            />
          </svg>
        )}
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
  props: PropsWithChildren<
    StyleProps & {
      name: string;
      createdAt: DateString;
      avatarUrl: string | null;
    }
  >,
) {
  return (
    <article class={clsxString("mt-4 mx-4 bg-[#181818] px-2 pb-4 pt-3 rounded-3xl flex flex-col", props.class ?? "")}>
      <div class="flex gap-[10px] items-center">
        {props.avatarUrl ? (
          <img class="w-10 aspect-square rounded-full object-cover" src={props.avatarUrl} />
        ) : (
          <div class="w-10 aspect-square rounded-full bg-gray-400" />
        )}
        <div class="flex flex-col">
          <div class="font-inter font-medium text-[17px] leading-[22px]">{props.name}</div>
          <div class="font-inter text-[13px] leading-4 text-[#AAA]">
            posted {formatPostDate(props.createdAt)} at {formatPostTime(props.createdAt)}
          </div>
        </div>
      </div>

      <div class="mt-3 mb-4 bg-[#212121] h-[1px]" />

      <div class="px-2 font-inter text-[16px] leading-[21px]">{props.children}</div>
    </article>
  );
}

export const Application = () => {
  onMount(() => {
    WebApp.ready();
    WebApp.expand();
  });

  const boardQuery = createQuery(() =>
    keysFactory.board({
      value: getProfileId(),
    })(),
  );

  const notesQuery = createInfiniteQuery(() =>
    infiniteQueryOptionsWithoutDataTag(
      // @ts-expect-error
      keysFactory.notes({
        board: getBoardId(),
      }),
    ),
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
    <main class="py-6 bg-[#0F0F0F] text-white min-h-screen">
      <section class="sticky z-10 top-0 bg-[#0F0F0F] px-6 py-4 flex flex-row gap-5 items-center">
        <img alt="Avatar" src={boardQuery.data?.profile?.photo} class="w-12 aspect-square rounded-full object-cover" />
        <div class="flex flex-col">
          <p class="font-bold font-inter text-[20px] leading-6">
            {boardQuery.data?.profile?.title ?? boardQuery.data?.name}
          </p>
          {/* TODO: add date */}
          {/* <p class="text-[15px] font-inter leading-[22px]">Member since Jan 2021</p> */}
        </div>
      </section>

      <UserStatus class="mt-4 mx-4">{boardQuery.data?.profile?.description}</UserStatus>
      <PostInput
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

      <section class="flex flex-col">
        {notes()?.length > 0 ? (
          <>
            <For each={notes()}>
              {(note) => (
                <BoardNote createdAt={note.createdAt} avatarUrl={note.author.photo} name={note.author.name}>
                  {note.content}
                </BoardNote>
              )}
            </For>

            {notesQuery.isFetchingNextPage ? (
              <div role="status" class="mx-auto mt-6">
                <LoadingSvg class="fill-[#FF375F] w-8 text-transparent" />
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
                class="font-inter flex items-center gap-x-2 mt-6 text-[17px] active:opacity-70 transition-opacity leading-[22px] mx-auto text-[#FF375F]"
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
          </>
        ) : (
          <div class="p-8 flex flex-col items-center">
            <img src="/assets/empty-notes.webp" class="w-32 aspect-square" alt="Questioning banana" />
            <strong class="font-inter text-center font-medium text-[20px] leading-[25px] mt-6">It's still empty</strong>
            <p class="text-[#AAA] font-inter text-center text-[17px] leading-[22px]">Be the first to post here!</p>
          </div>
        )}
      </section>
    </main>
  );
};
