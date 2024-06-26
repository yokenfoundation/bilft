import { keysFactory } from "@/api/api";
import type { Note } from "@/api/model";
import { assertOk } from "@/common";
import { useSearchParams } from "@solidjs/router";
import { createInfiniteQuery } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createMemo } from "solid-js";
import { BoardNote } from "../BoardNote/BoardNote";
import { LoadingSvg } from "../LoadingSvg";

export const CommentsPage = () => {
  const [searchParams] = useSearchParams();
  // [TODO]: add validation
  const note = createMemo(() => {
    assertOk(searchParams.note);
    return JSON.parse(searchParams.note) as Note;
  });

  const commentsQuery = createInfiniteQuery(() =>
    keysFactory.comments({
      noteId: note().id,
    }),
  );

  const comments = createMemo(() =>
    commentsQuery.isSuccess
      ? commentsQuery.data.pages.flatMap((it) => it.items)
      : [],
  );

  return (
    <main class="px-4">
      <BoardNote class="my-4">
        <Switch
          fallback={<BoardNote.PrivateHeader createdAt={note().createdAt} />}
        >
          <Match when={note().author}>
            {(author) => (
              <BoardNote.PublicHeader
                name={author().name}
                avatarUrl={author().photo}
                authorId={author().id}
                createdAt={note().createdAt}
              />
            )}
          </Match>
        </Switch>

        <BoardNote.Divider />

        <BoardNote.Content>{note().content}</BoardNote.Content>
      </BoardNote>

      <Switch>
        <Match when={commentsQuery.isLoading}>
          <div class="flex w-full flex-1 items-center justify-center">
            <LoadingSvg class="w-8 fill-accent text-transparent" />
          </div>
        </Match>
        <Match when={comments().length === 0}>
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
              Be the first to comment here!
            </p>
          </div>
        </Match>
        <Match when={comments().length > 0}>
          <For each={comments()}>
            {(comment) => <div>{comment.content}</div>}
          </For>

          <Show when={commentsQuery.isFetchingNextPage}>
            <div role="status" class="mx-auto mt-6">
              <LoadingSvg class="w-8 fill-accent text-transparent" />
              <span class="sr-only">Next comments is loading</span>
            </div>
          </Show>
        </Match>
      </Switch>
    </main>
  );
};
