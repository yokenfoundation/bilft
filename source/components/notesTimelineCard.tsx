import Styled from "styled-components";
import React from "react";
import type { ApplicationContext } from "@/context/context";
import WebApp from "@twa-dev/sdk";
import type model from "@/api/model";

const DOMNotesTimelineCard = Styled.div.attrs({ className: "terminal-card" })`
`;

const DOMNotesTimelineCardContent = Styled.div`
  white-space: pre-wrap;
`;

interface INotesTimelineCard {
  note: model.Note;
  context: ApplicationContext;
}

const NotesTimelineCard: React.FC<INotesTimelineCard> = (p) => {
  const note = p.note;
  return (
    // <div className="terminal-card" onclick="window._navigate('id${note.author.id}')">
    <DOMNotesTimelineCard>
      <header>{note.author.name}</header>
      <DOMNotesTimelineCardContent>{note.content}</DOMNotesTimelineCardContent>
    </DOMNotesTimelineCard>
  );
};

export default NotesTimelineCard;
