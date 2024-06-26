import {
  clsxString,
  themeParams,
  type DateString,
  type StyleProps,
} from "@/common";
import { AnonymousAvatarIcon } from "@/icons";
import { A } from "@solidjs/router";
import type { ParentProps } from "solid-js";
import { AvatarIcon } from "./AvatarIcon";

const todayDate = new Date();
const formatPostDate = (createdAt: DateString) => {
  const date = new Date(createdAt);

  const isSameMonth =
    todayDate.getMonth() === date.getMonth() &&
    todayDate.getFullYear() === date.getFullYear();
  if (isSameMonth && todayDate.getDate() === date.getDate()) {
    return "today";
  }
  if (isSameMonth && todayDate.getDate() - 1 === date.getDate()) {
    return "yesterday";
  }

  return date.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatPostTime = (createdAt: DateString) =>
  new Date(createdAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const BoardNotePublicHeader = (props: {
  name: string;
  avatarUrl: string | null;
  authorId: string | null;
  createdAt: DateString;

  onClick?: (e: MouseEvent) => void;
}) => (
  <A
    href={`/board/${props.authorId}`}
    onClick={props.onClick}
    class="flex items-center gap-[10px]"
  >
    <AvatarIcon lazy isLoading={false} url={props.avatarUrl} class="w-10" />
    <div class="flex flex-col">
      <div class="font-inter text-[17px] font-medium leading-[22px]">
        {props.name}
      </div>
      <div class="font-inter text-[13px] leading-4 text-subtitle">
        posted {formatPostDate(props.createdAt)} at{" "}
        {formatPostTime(props.createdAt)}
      </div>
    </div>
  </A>
);
const BoardNoteAnonymousHeader = (props: { createdAt: DateString }) => (
  <div class="flex items-center gap-[10px]">
    <AnonymousAvatarIcon
      class={clsxString(
        themeParams.isDark
          ? "fill-[#1C1C1D] text-white"
          : "fill-slate-200 text-black",
      )}
    />
    <div class="flex flex-col">
      <div class="font-inter text-[17px] font-medium leading-[22px]">
        Anonymously
      </div>
      <div class="font-inter text-[13px] leading-4 text-subtitle">
        posted {formatPostDate(props.createdAt)} at{" "}
        {formatPostTime(props.createdAt)}
      </div>
    </div>
  </div>
);
const BoardNoteDivider = (props: StyleProps) => (
  <div
    class={clsxString(
      "mx-[2px] my-[10px] h-separator bg-separator",
      props.class ?? "",
    )}
  />
);

const BoardNoteContent = (props: ParentProps<StyleProps>) => (
  <div
    class={clsxString(
      "overflow-hidden whitespace-pre-wrap font-inter text-[16px] leading-[21px]",
      props.class ?? "",
    )}
  >
    {props.children}
  </div>
);

function BoardNoteRoot(props: ParentProps<StyleProps>) {
  return (
    <article
      class={clsxString(
        "mx-4 flex flex-col rounded-3xl bg-section-bg px-[14px] pb-4 pt-[14px] transition-transform has-[a:active]:scale-[0.98]",
        props.class ?? "",
      )}
    >
      {props.children}
    </article>
  );
}

export const BoardNote = Object.assign(BoardNoteRoot, {
  PublicHeader: BoardNotePublicHeader,
  PrivateHeader: BoardNoteAnonymousHeader,
  Divider: BoardNoteDivider,
  Content: BoardNoteContent,
});
