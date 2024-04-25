namespace model {
  export const _ = 0;

  export type NoteAuthor = {
    id: string;
    name: string;
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
    name?: string;

    profile?: {
      photo?: string;
      title: string;
      description?: string;
    };

    notes: NoteArray;
  };
}

export default model;
