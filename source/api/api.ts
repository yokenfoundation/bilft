import model from "./model";
import axios from "axios";

import { queryOptions } from "@tanstack/solid-query";
import { infiniteQueryOptions } from "@/queryClientTypes";
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
  "/board/createNote": RequestResponse<{ board: string; content: string }, model.Note>;
  "/board/getNotes": RequestResponse<{ board: string; next?: string }, model.NoteArray>;
  "/me": RequestResponse<void, { wallet: undefined | {} }>;
  "/me/linkWallet": RequestResponse<
    {
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
    },
    {
      wallet: {
        address: string;
        tokens: {
          yo: string;
        };
      };
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

export const fetchMethodCurry =
  <T extends AvailableRequests>(path: T) =>
  (data: PickRequest<T>) =>
    fetchMethod(path, data);

export const keysFactory = {
  board: (params: PickRequest<"/board/resolve">) =>
    queryOptions(() => ({
      queryFn: () => fetchMethod("/board/resolve", params),
      queryKey: ["board", params],
    })),
  notes: ({ board }: Omit<PickRequest<"/board/getNotes">, "next">) =>
    infiniteQueryOptions({
      queryKey: ["notes", board],
      initialPageParam: undefined,
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        fetchMethod("/board/getNotes", {
          board,
          next: pageParam,
        }),
      getNextPageParam: ({ next }) => next,
    }),
};
