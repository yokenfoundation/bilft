import WebApp from "@/telegram";
import model from "@/model";

import axios from "axios";

namespace api {
  const instance = axios.create({
    baseURL: "https://redsun.yoken.io/api",
    timeout: 10000,
  });

  async function call<T>(method: "post" | "put" | "get", path: string, data: any): Promise<T> {
    const authentication = {
      authentication_data: WebApp.initData,
    };
    return instance[method](path, { ...authentication, ...data }).then((result) => {
      if (result.status >= 400) {
        let message = `${result.status}`;
        if ("error" in result.data && "message" in result.data.error) {
          message = `${result.status}: ${result.data.error.message}`;
        } else {
          message = `${result.status}`;
        }
        throw new Error(message);
      } else {
        return result.data as T;
      }
    });
  }

  export const board = {
    resolve: async (data: { board?: string }): Promise<model.Board> => {
      return call("post", "/board/resolve", { value: data.board });
    },

    write: async (data: { board: string; content: string }): Promise<model.Note> => {
      return call("post", `/board/createNote`, { board: data.board, content: data.content });
    },

    get: async (data: { board: string; next?: string }): Promise<model.NoteArray> => {
      return call("post", `/board/getNotes`, { board: data.board, next: data.next });
    },
  };
}

export default api;
