import WebApp from "@twa-dev/sdk";
import model from "./model";
import axios from "axios";

import { useState } from "react";
import { useApplicationContext } from "@/context/context";

const instance = axios.create({
  // baseURL: "https://redsun.yoken.io/api",
  baseURL: "https://6f5d51adf2a3.ngrok.app/api",
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
type PickMethodResult<T extends AvailableRequests> = PickResponse<T> | model.Error | undefined;

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
          setResponse(result.data as PickResponse<T>);
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
          setResponse({ error });
        } else {
          setResponse({ error: new Error(`${_status ?? 0}: ${_message}`) });
        }
      })
      .finally(() => {
        context.loading.decrement();
      });
  };

  return [response, execute];
};

export { useMethod };
