import model from "./model";
import axios from "axios";

import { queryOptions, infiniteQueryOptions } from "@tanstack/solid-query";
import { authData } from "@/common";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
});

type RequestResponse<Request, Response> = {
  request: Request;
  response: Response;
};

type RequestResponseMappings = {
  "/board/resolve": RequestResponse<{ value: string }, model.Board>;
  "/board/createNote": RequestResponse<
    { board: string; content: string; type: "private" | "public" | "public-anonymous" },
    model.Note
  >;
  "/board/getNotes": RequestResponse<{ board: string; next?: string }, model.NoteArray>;
  "/me": RequestResponse<
    void,
    {
      wallet?: model.Wallet;
    }
  >;
  "/me/linkWallet": RequestResponse<
    model.WalletConfirmation,
    {
      wallet: model.Wallet;
    }
  >;
  "/me/unlinkWallet": RequestResponse<void, void>;
};
type AvailableRequests = keyof RequestResponseMappings;

type PickRequest<T extends AvailableRequests> = Pick<RequestResponseMappings, T>[T]["request"];
type PickResponse<T extends AvailableRequests> = Pick<RequestResponseMappings, T>[T]["response"];

export const fetchMethod = async <T extends AvailableRequests>(
  path: T,
  data: PickRequest<T>,
): Promise<PickResponse<T>> =>
  instance
    .post(path, {
      ...data,
      authentication_data: authData,
    })
    .then((it) => it.data);

export const getWalletError = (response: { status: number; data: unknown }): model.WalletError | null => {
  if (response.status !== 403) {
    return null;
  }
  if (!response.data || typeof response.data !== "object") {
    return null;
  }
  const data: {
    error?: {
      reason?: string;
    };
  } = response.data;

  if (data?.error?.reason !== "no_connected_wallet" && data.error?.reason !== "insufficient_balance") {
    return null;
  }

  return data as model.WalletError;
};

export const fetchMethodCurry =
  <T extends AvailableRequests>(path: T) =>
  (data: PickRequest<T>) =>
    fetchMethod(path, data);

export const keysFactory = {
  board: (params: PickRequest<"/board/resolve">) =>
    queryOptions({
      queryFn: () => fetchMethod("/board/resolve", params),
      queryKey: ["board", params],
    }),
  notes: ({ board }: Omit<PickRequest<"/board/getNotes">, "next">) =>
    infiniteQueryOptions({
      queryKey: ["notes", board],
      initialPageParam: undefined,
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        fetchMethod("/board/getNotes", {
          board,
          next: pageParam,
        }),
      getNextPageParam: (response) => response?.next,
    }),
  me: queryOptions({
    queryFn: () => fetchMethod("/me", undefined),
    queryKey: ["me"],
  }),
};
