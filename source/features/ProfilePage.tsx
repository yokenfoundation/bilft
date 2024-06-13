import { type ParentProps, createComputed, createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import {
  addPrefix,
  clsxString,
  getSelfUserId,
  isEqualIds,
  removePrefix,
  type DateString,
  type StyleProps,
} from "../common";
import { createInfiniteQuery, createQuery } from "@tanstack/solid-query";
import { A, useParams } from "@solidjs/router";
import { ArrowPointUp } from "../icons";
import { PostCreator } from "./PostCreator";
import { keysFactory } from "../api/api";
import { LoadingSvg } from "./LoadingSvg";

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
    }),
  );

  const getBoardId = () => removePrefix(props.idWithoutPrefix);

  const notesQuery = createInfiniteQuery(() => ({
    ...keysFactory.notes({
      board: getBoardId(),
    }),
    reconcile: "id",
  }));
  const notes = createMemo(() => (notesQuery.isSuccess ? notesQuery.data.pages.flatMap((it) => it.data) : []));

  return (
    <main class="pb-6 pt-4 flex flex-col text-text min-h-screen">
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

      <PostCreator boardId={getBoardId()} />

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
                <ArrowPointUp />
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
