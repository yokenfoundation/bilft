import WebApp from "@twa-dev/sdk";
import model from "./model";
import axios from "axios";

import { useState } from "react";
import { useApplicationContext } from "@/context/context";
import { queryOptions } from "@tanstack/react-query";

const instance = axios.create({
  // prod
  // baseURL: "https://redsun.yoken.io/api",
  baseURL: "https://redsun-staging.yoken.io/api/",
  timeout: 10000,
});

type RequestResponse<Request, Response> = {
  request: Request;
  response: Response;
};

type AvailableRequests = "/board/resolve" | "/board/createNote" | "/board/getNotes";
type RequestResponseMappings = {
  "/board/resolve": RequestResponse<{ value: string }, model.Board>;
  "/board/createNote": RequestResponse<{ board: string; content: string }, model.Board>;
  "/board/getNotes": RequestResponse<{ board: string; next?: string }, model.NoteArray>;
};

type PickRequest<T extends AvailableRequests> = Pick<RequestResponseMappings, T>[T]["request"];
type PickResponse<T extends AvailableRequests> = Pick<RequestResponseMappings, T>[T]["response"];
type PickMethodResult<T extends AvailableRequests> =
  | (PickResponse<T> & { isError: false })
  | (model.Error & { isError: true })
  | undefined;

export const fetchMethod = async <T extends AvailableRequests>(
  path: T,
  data: PickRequest<T>,
): Promise<PickResponse<T>> =>
  instance
    .post(path, {
      ...data,
      authentication_data: WebApp.initData,
    })
    .then((it) => it.data);

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
};

/**
 *
 * @deprecated
 */
const useMethod = <T extends AvailableRequests>(path: T, data: PickRequest<T>): [PickMethodResult<T>, () => void] => {
  const context = useApplicationContext();
  const [response, setResponse] = useState<PickMethodResult<T>>(undefined);

  const authentication = { authentication_data: WebApp.initData };
  const body = { ...authentication, ...data };

  const execute = () => {
    context.loading.increment();
    instance
      .post(path, body)
      .then((result) => {
        if (result.status >= 400) {
          let message = `${result.status}`;
          if ("error" in result.data && "message" in result.data.error) {
            message = `${result.status}: ${result.data.error.message}`;
          } else {
            message = `${result.status}`;
          }
          throw new Error(message);
        } else {
          setResponse({ ...(result.data as PickResponse<T>), isError: false });
        }
      })
      .catch((error) => {
        const _error = error as {
          response?: {
            status?: number;
            data?: { error?: { message?: string } };
          };
        };

        const _status = _error.response?.status;
        const _message = _error.response?.data?.error?.message;
        if (!_message) {
          setResponse({ error, isError: true });
        } else {
          setResponse({ error: new Error(`${_status ?? 0}: ${_message}`), isError: true });
        }
      })
      .finally(() => {
        context.loading.decrement();
      });
  };

  return [response, execute];
};

export { useMethod };
