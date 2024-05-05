import React, { useEffect, useRef, type PropsWithChildren, useState } from "react";
import Profile from "./pages/profile";
import WebApp from "@twa-dev/sdk";
import LoadingIndicator from "./components/loadingIndicator";
import { useApplicationContext } from "./context/context";
import { clsxString, getProfileId, type StyleProps } from "./common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchMethodCurry, keysFactory } from "./api/api";

const UserStatus = (props: PropsWithChildren<StyleProps>) => (
  <article className={clsxString("relative flex flex-col", props.className ?? "")}>
    <svg
      className="absolute text-accent left-0 top-0"
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
    <div className="px-4 py-2 self-start rounded-3xl ml-1 bg-accent min-h-[38px]">{props.children}</div>
  </article>
);

function PostInput(props: { value: string; onChange: (s: string) => void }) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = props.value.length === 0;

  return (
    <form
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          inputRef.current?.focus();
        }
      }}
      className="mt-4 p-4 bg-[#AAA] bg-opacity-[8%] border-[#AAA] border mx-4 border-opacity-15 rounded-3xl flex flex-row gap-[10px] items-center overflow-hidden cursor-text justify-between"
    >
      <div
        className='flex-1 grid grid-cols-1 [&>textarea]:[grid-area:1/1/2/2] after:[grid-area:1/1/2/2] font-inter text-[16px] leading-[21px] after:font-[inherit] after:invisible after:whitespace-pre-wrap after:break-words after:content-[attr(data-value)_"_"]'
        data-value={props.value}
      >
        <textarea
          placeholder="Text me here..."
          rows={1}
          onChange={(e) => {
            props.onChange(e.target.value);
          }}
          ref={inputRef}
          className="bg-transparent overflow-hidden break-words max-w-full resize-none border-none focus:border-none focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isEmpty}
        className="mt-auto w-7 aspect-square flex items-center justify-center [&>svg>path]:fill-[#FF375F] [&:disabled>svg>path]:fill-[#AAAAAA33]"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28ZM14.6498 7.37729C14.48 7.20016 14.2453 7.1 14 7.1C13.7547 7.1 13.52 7.20016 13.3502 7.37729L8.35021 12.5947C8.00629 12.9535 8.01842 13.5233 8.37729 13.8672C8.73615 14.2111 9.30587 14.199 9.64979 13.8401L13.1 10.2399V20C13.1 20.4971 13.5029 20.9 14 20.9C14.4971 20.9 14.9 20.4971 14.9 20V10.2399L18.3502 13.8401C18.6941 14.199 19.2638 14.2111 19.6227 13.8672C19.9816 13.5233 19.9937 12.9535 19.6498 12.5947L14.6498 7.37729Z"
            className="transition-[fill]"
          />
        </svg>
      </button>
    </form>
  );
}
function BoardNote(
  props: PropsWithChildren<
    StyleProps & {
      name: string;
      // postDate: string
      avatarUrl: string | null;
    }
  >,
) {
  return (
    <article
      className={clsxString("mt-4 mx-4 bg-[#181818] px-2 pb-4 pt-3 rounded-3xl flex flex-col", props.className ?? "")}
    >
      <div className="flex gap-[10px] items-center">
        {props.avatarUrl ? (
          <img className="w-10 aspect-square rounded-full object-cover" src={props.avatarUrl} />
        ) : (
          <div className="w-10 aspect-square rounded-full bg-gray-400" />
        )}
        <div className="flex flex-col">
          <div className="font-inter font-medium text-[17px] leading-[22px]">{props.name}</div>
          {/* <div className="font-inter text-[13px] leading-4 text-[#AAA]">posted 20.02.2021 at 1:34 pm</div> */}
        </div>
      </div>

      <div className="mt-3 mb-4 bg-[#212121] h-[1px]" />

      <div className="px-2 font-inter text-[16px] leading-[21px]">{props.children}</div>
    </article>
  );
}

const Application: React.FunctionComponent = () => {
  const context = useApplicationContext();
  useEffect(() => {
    WebApp.ready();
  }, []);

  const boardQuery = useQuery(
    keysFactory.board({
      value: getProfileId(),
    }),
  );

  const addNoteMutation = useMutation({
    mutationFn: fetchMethodCurry("/board/createNote"),
  });

  const [inputValue, setInputValue] = useState("");
  return (
    <main>
      <section className="mt-6">
        <div className="px-6 py-4 flex flex-row gap-5 items-center">
          <img
            alt="Avatar"
            src={boardQuery.data?.profile?.photo}
            className="w-12 aspect-square rounded-full object-cover"
          />
          <div className="flex flex-col">
            <p className="font-bold font-inter text-[20px] leading-6">
              {boardQuery.data?.profile?.title ?? boardQuery.data?.name}
            </p>
            {/* TODO: add date */}
            {/* <p className="text-[15px] font-inter leading-[22px]">Member since Jan 2021</p> */}
          </div>
        </div>

        <UserStatus className="mt-4 mx-4">{boardQuery.data?.profile?.description}</UserStatus>
        <PostInput value={inputValue} onChange={setInputValue} />
      </section>

      {boardQuery.data && boardQuery.data?.notes.data.length > 0 ? (
        boardQuery.data.notes.data.map((note) => (
          <BoardNote
            // TODO: use note id
            key={note.author.id + note.content}
            // TODO: add avatar
            avatarUrl={null}
            name={note.author.name}
          >
            {note.content}
          </BoardNote>
        ))
      ) : (
        <div className="p-8 flex flex-col items-center">
          <img src="/assets/empty-notes.webp" className="w-32 aspect-square" alt="Questioning banana" />
          <strong className="font-inter text-center font-medium text-[20px] leading-[25px] mt-6">
            It's still empty
          </strong>
          <p className="text-[#AAA] font-inter text-center text-[17px] leading-[22px]">Be the first to post here!</p>
        </div>
      )}

      <LoadingIndicator context={context} hidden={!context.loading.active()} />
      <Profile context={context}></Profile>
    </main>
  );
};

export default Application;
