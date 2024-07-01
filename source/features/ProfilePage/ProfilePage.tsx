import { A, useNavigate, useParams } from "@solidjs/router";
import { createInfiniteQuery, createQuery } from "@tanstack/solid-query";
import {
  For,
  Match,
  Show,
  Switch,
  createMemo,
  type ParentProps,
} from "solid-js";
import { keysFactory } from "../../api/api";
import {
  addPrefix,
  clsxString,
  getSelfUserId,
  isEqualIds,
  removePrefix,
  type StyleProps,
} from "../../common";
import { AnonymousAvatarIcon, ArrowPointUp } from "../../icons";

import { AvatarIcon } from "../BoardNote/AvatarIcon";
import { BoardNote } from "../BoardNote/BoardNote";
import { LoadingSvg } from "../LoadingSvg";
import { PostCreator } from "./PostCreator";

const UserStatus = (props: ParentProps<StyleProps>) => (
  <article class={clsxString("relative flex flex-col", props.class ?? "")}>
    <svg
      class="absolute left-0 top-0 text-accent"
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
    <div class="ml-1 min-h-[38px] self-start rounded-3xl bg-accent px-4 py-2">
      {props.children}
    </div>
  </article>
);

const UserProfilePage = (props: {
  isSelf: boolean;
  idWithoutPrefix: string;
}) => {
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
  const notes = createMemo(() =>
    notesQuery.isSuccess ? notesQuery.data.pages.flatMap((it) => it.data) : [],
  );
  const navigate = useNavigate();

  return (
    <main class="flex min-h-screen flex-col pb-6 pt-4 text-text">
      <section class="sticky top-0 z-10 flex flex-row items-center gap-3 bg-secondary-bg px-6 py-2">
        <AvatarIcon
          class="w-12"
          isLoading={boardQuery.isLoading}
          url={boardQuery.data?.profile?.photo ?? null}
        />
        <div class="flex flex-1 flex-col">
          <p class="relative font-inter text-[20px] font-bold leading-6">
            {boardQuery.data?.profile?.title ?? boardQuery.data?.name ?? " "}
            <Show when={boardQuery.isLoading}>
              <div class="absolute inset-y-1 left-0 right-[50%] animate-pulse rounded-xl bg-gray-600" />
            </Show>
          </p>
          {/* TODO: add date */}
          {/* <p class="text-[15px] font-inter leading-[22px]">Member since Jan 2021</p> */}
        </div>
      </section>

      <UserStatus class="mx-4 mt-2 text-button-text">
        {boardQuery.isLoading
          ? "Loading..."
          : boardQuery.data?.profile?.description}
      </UserStatus>

      <PostCreator class="mx-4 mt-6" boardId={getBoardId()} />

      <section class="mt-6 flex flex-1 flex-col">
        <Switch>
          <Match when={notesQuery.isLoading}>
            <div class="flex w-full flex-1 items-center justify-center">
              <LoadingSvg class="w-8 fill-accent text-transparent" />
            </div>
          </Match>
          <Match when={notes().length === 0}>
            <div class="flex flex-col items-center p-8">
              <img
                src="/assets/empty-notes.webp"
                class="aspect-square w-32"
                alt="Questioning banana"
              />
              <strong class="mt-6 text-center font-inter text-[20px] font-medium leading-[25px]">
                It's still empty
              </strong>
              <p class="text-center font-inter text-[17px] leading-[22px] text-subtitle">
                Be the first to post here!
              </p>
            </div>
          </Match>
          <Match when={notes().length > 0}>
            <For each={notes()}>
              {(note) => (
                <BoardNote class="mx-4 mb-4">
                  <BoardNote.Card>
                    {/* extends to match based on type */}
                    <Switch
                      fallback={
                        <BoardNote.PrivateHeader createdAt={note.createdAt} />
                      }
                    >
                      <Match when={note.author}>
                        {(author) => (
                          <BoardNote.PublicHeader
                            name={author().name}
                            avatarUrl={author().photo}
                            authorId={author().id}
                            createdAt={note.createdAt}
                            onClick={(e) => {
                              if (author().id === props.idWithoutPrefix) {
                                e.preventDefault();
                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
                              }
                            }}
                          />
                        )}
                      </Match>
                    </Switch>
                    <BoardNote.Divider />
                    <BoardNote.Content>{note.content}</BoardNote.Content>
                  </BoardNote.Card>
                  <div class="mx-4 mt-2 flex self-stretch">
                    <Switch>
                      <Match when={note.lastComment}>
                        {(lastComment) => (
                          <div class="relative min-w-full overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
                            <Show
                              fallback={
                                <div class="inline-flex translate-y-1 gap-1 font-inter text-[14px] font-semibold leading-[18px]">
                                  <AnonymousAvatarIcon class="h-[18px] w-[18px]" />
                                  Anonymous
                                </div>
                              }
                              when={
                                lastComment().type === "public" &&
                                lastComment().author
                              }
                            >
                              {(author) => (
                                <A
                                  class="inline-flex translate-y-1 gap-1 font-inter text-[14px] font-semibold leading-[18px] transition-opacity active:opacity-70"
                                  href={`/board/${author().id}`}
                                >
                                  <AvatarIcon
                                    class="h-[18px] w-[18px]"
                                    isLoading={false}
                                    url={author().photo}
                                  />
                                  {author().name}
                                </A>
                              )}
                            </Show>
                            <span class="ml-1 select-none overflow-hidden font-inter text-[14px] leading-[18px]">
                              {lastComment().content}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                navigate(
                                  `/comments/${note.id}?note=${JSON.stringify(note)}&boardId=${boardQuery.data?.id}`,
                                );
                              }}
                              class="absolute bottom-0 right-0 bg-secondary-bg pl-2 font-inter text-[15px] leading-[18px] text-accent transition-opacity active:opacity-70"
                            >
                              show more ({note.commentsCount})
                            </button>
                            {/* <button
                              type="button"
                              onClick={() => {
                                navigate(
                                  `/comments/${note.id}?note=${JSON.stringify(note)}`,
                                );
                              }}
                              class="ml-2 font-inter text-[15px] leading-[18px] text-accent transition-opacity active:opacity-70"
                            >
                              show more ({note.commentsCount})
                            </button> */}
                          </div>
                        )}
                      </Match>
                      <Match when={note.commentsCount === 0}>
                        <button
                          type="button"
                          onClick={() => {
                            navigate(
                              `/comments/${note.id}?note=${JSON.stringify(note)}&boardId=${boardQuery.data?.id}`,
                            );
                          }}
                          class="ml-auto font-inter text-[15px] leading-[18px] text-accent transition-opacity active:opacity-70"
                        >
                          post you reply
                        </button>
                      </Match>
                    </Switch>
                  </div>
                </BoardNote>
              )}
            </For>

            <Switch>
              <Match when={notesQuery.isFetchingNextPage}>
                <div role="status" class="mx-auto mt-6">
                  <LoadingSvg class="w-8 fill-accent text-transparent" />
                  <span class="sr-only">Next boards is loading</span>
                </div>
              </Match>
              <Match when={notes().length >= 8}>
                <button
                  onClick={() => {
                    window.scrollTo({
                      behavior: "smooth",
                      top: 0,
                    });
                  }}
                  class="mx-auto mt-6 flex items-center gap-x-2 font-inter text-[17px] leading-[22px] text-accent transition-opacity active:opacity-70"
                >
                  Back to top
                  <ArrowPointUp />
                </button>
              </Match>
            </Switch>
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

  return (
    <UserProfilePage
      idWithoutPrefix={idWithoutPrefix()}
      isSelf={isEqualIds(selfUserId, idWithoutPrefix())}
    />
  );
};
