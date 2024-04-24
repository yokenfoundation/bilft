namespace model {
  export const _ = 0;

  export type NoteAuthor = {
    name: string;
    url?: string;
  };

  export type Note = {
    author: NoteAuthor;
    content: string;
  };

  export type NoteArray = {
    next?: string;
    data: Note[];
  };

  export type Board = {
    id: string;
    isme: boolean;
    name: string;
    notes: NoteArray;
  };
}

export default model;
