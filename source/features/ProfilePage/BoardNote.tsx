import {
  type StyleProps,
  type DateString,
  clsxString,
  themeParams,
} from "@/common";
import { A } from "@solidjs/router";
import type { ParentProps } from "solid-js";
import { AvatarIcon } from "./AvatarIcon";
import { AnonymousAvatarIcon } from "@/icons";

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
    class="flex gap-[10px] items-center"
  >
    <AvatarIcon lazy isLoading={false} url={props.avatarUrl} class="w-10" />
    <div class="flex flex-col">
      <div class="font-inter font-medium text-[17px] leading-[22px]">
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
  <div class="flex gap-[10px] items-center">
    <AnonymousAvatarIcon
      class={clsxString(
        themeParams.isDark
          ? "text-white fill-[#1C1C1D]"
          : "text-black fill-slate-200",
      )}
    />
    <div class="flex flex-col">
      <div class="font-inter font-medium text-[17px] leading-[22px]">
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
      "mx-[2px] my-[10px] bg-gray-300/50 h-[1px]",
      props.class ?? "",
    )}
  />
);

const BoardNoteContent = (props: ParentProps<StyleProps>) => (
  <div
    class={clsxString(
      "whitespace-pre-wrap font-inter text-[16px] leading-[21px]",
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
        "mx-4 bg-section-bg px-[14px] pb-4 pt-[14px] rounded-3xl flex flex-col transition-transform has-[a:active]:scale-[0.98]",
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
