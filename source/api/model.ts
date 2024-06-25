import type { DateString } from "@/common";

export type NoteAuthor = {
  id: string;
  name: string;
  photo: string;
};

export type Note = {
  id: string;
  author?: NoteAuthor;
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
};

export type Wallet = {
  address: string;
  friendlyAddress: string;
  tokens: {
    yo: string;
  };
};

export type WalletConfirmation = {
  address: string;
  proof: {
    timestamp: number;
    domain: {
      value: string;
      lengthBytes: number;
    };
    signature: string;
    payload: string;
  };
  stateInit: string;
  publicKey: string;
};

export type Error = {
  error: {
    message: string;
  };
};

export type WalletError = {
  error: {
    reason: "insufficient_balance" | "no_connected_wallet";
    payload: {
      requiredBalance: string;
    };
  };
};
