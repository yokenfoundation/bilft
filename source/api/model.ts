import type { DateString } from "@/common";

namespace model {
  const _ = 0;

  export type NoteAuthor = {
    id: string;
    name: string;
  };

  export type Note = {
    author: NoteAuthor;
    createdAt: DateString;
    content: string;
  };

  export type NoteArray = {
    next?: string;
    data: Note[];
  };

  export type BoardProfile = {
    photo?: string;
    title: string;
    description?: string;
  };

  export type Board = {
    id: string;
    isme: boolean;
    name?: string;
    profile?: BoardProfile;
    notes: NoteArray;
  };

  export type Error = {
    error: {
      message: string;
    };
  };
}

export default model;
