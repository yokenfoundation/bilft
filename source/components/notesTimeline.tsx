import Styled from "styled-components";
import React, { useEffect, useState } from "react";
import type { ApplicationContext } from "@/context/context";
import WebApp from "@twa-dev/sdk";
import type model from "@/api/model";
import NotesTimelineCard from "./notesTimelineCard";
import { useMethod } from "@/api/api";

const DOMNotesCursor = Styled.div`
  height: 1px;
`;

const DOMNotesTimeline = Styled.section`
`;

const DOMNotesInnerTimeline = Styled.div.attrs({ className: "terminal-timeline" })`
  padding-left: 20px;
  
  &:before {
    left: 4.5px;
    width: 1px;
  }
      
  > .terminal-card::before {
    margin-top: 12px;
    border: 1px solid var(--secondary-color);
    left: 0px;
    width: 8px;
    height: 8px;
  }
`;

interface INotesTimeline {
  board: string;
  profile?: model.BoardProfile;
  initial: model.NoteArray;
  context: ApplicationContext;
}

const NotesTimeline: React.FC<INotesTimeline> = (p) => {
  const [data, setData] = useState<model.NoteArray | undefined>(undefined);

  //   if (data.next) {
  const [page, fetch] = useMethod("/board/getNotes", { board: p.board, next: data?.next ?? p.initial.next });
  const scroll = () => {
    const bottom = window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight;
    if (bottom) {
      return;
    }
    console.log("test");
    //   fetchData();
  };

  if (page && !("error" in page)) {
    setData((previous) => {
      let data = previous?.data ?? [];
      return {
        next: page.next,
        data: [...data, ...page.data],
      };
    });
  }

  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  //   }

  let array = p.initial.data;
  if (data?.data) {
    array = [...array, ...data.data];
  }

  return (
    <DOMNotesTimeline>
      <header>
        <h3>Timeline</h3>
      </header>
      <DOMNotesInnerTimeline>
        {array.map((n) => {
          return <NotesTimelineCard note={n} context={p.context}></NotesTimelineCard>;
        })}
      </DOMNotesInnerTimeline>
    </DOMNotesTimeline>
  );
};

export default NotesTimeline;
