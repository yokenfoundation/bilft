import "./polyfill";

import WebApp from "@/telegram/index";
import ui from "./ui";
import api from "./api";

function route(url: string) {
  WebApp.BackButton.show;
}

const button = {
  send: (board: string) => {
    ui.button.update("send");
    ui.button.click(() => {
      const content = ui.send.data().content;
      if (content.length == 0) {
        return;
      }

      ui.button.update("sending");
      ui.header.loading(true);
      ui.send.disaable();

      api.board
        .write({ board, content })
        .then((note) => {
          ui.send.clear();
          ui.timeline.prepend({ data: [note] });
          button.share(board);
        })
        .catch((error) => {
          ui.error.show(error);
          ui.button.update("send");
        })
        .finally(() => {
          ui.header.loading(false);
          ui.send.enable();
        });
    });
  },
  share: (board: string) => {
    switch (WebApp.platform) {
      case "android":
      case "android_x":
      case "ios":
        break;
      default:
        ui.button.update("hidden");
        return;
    }

    ui.button.update("share");
    ui.button.click(() => {
      let _url = encodeURIComponent(`https://t.me/bilft_bot/www?startapp=id${board}`);
      let _text = encodeURIComponent("Yo! Check out what's written on this board");
      WebApp.openTelegramLink(`http://t.me/share/url?url=${_url}&text=${_text}`);
    });
  },
};

function ready(board: string) {
  button.share(board);
  ui.send.onactive((active) => {
    const empty = ui.send.data().content.length == 0;
    if (active) {
      if (empty) {
        ui.button.update("hidden");
      } else {
        button.send(board);
      }
    } else {
      if (empty) {
        button.share(board);
      } else {
        button.send(board);
      }
    }
  });
  ui.send.onchange((content) => {
    if (content.length > 0) {
      button.send(board);
    } else if (ui.send.active()) {
      ui.button.update("hidden");
    } else {
      button.share(board);
    }
  });
}

function load(board: string, next: string) {
  ui.header.loading(true);
  api.board
    .get({ board, next })
    .then((notes) => {
      ui.timeline.append(notes);

      const next = notes.next;
      if (!next) {
        return;
      }

      ui.cursor.onvisibleonce(() => {
        load(board, next);
      });
    })
    .catch((error) => {
      ui.error.show(error);
    })
    .finally(() => {
      ui.header.loading(false);
    });
}

const stack = {
  _stack: [] as string[],
  assign: async (board: string) => {
    ui.cursor.cancel();
    ui.footer.text(undefined);
    ui.header.update(undefined);
    ui.timeline.clear();

    ui.header.loading(true);

    try {
      const data = await api.board.resolve({ board });
      ready(data.id);

      ui.header.update(data);
      ui.timeline.replace(data.notes);
      ui.cursor.onvisibleonce(() => {
        if (!data.notes.next) {
          return;
        }
        load(data.id, data.notes.next);
      });
    } catch (error) {
      ui.error.show(error, false);
    } finally {
      ui.header.loading(false);
    }
  },
  button: () => {
    if (stack._stack.length > 1) {
      WebApp.BackButton.show();
    } else {
      WebApp.BackButton.hide();
    }
  },
  push: async (board: string) => {
    if (stack._stack.length > 0 && stack._stack[stack._stack.length - 1] === board) {
      return;
    }

    stack._stack.push(board);
    stack.assign(board);
    stack.button();
  },
  pop: async () => {
    if (stack._stack.length < 2) {
      return;
    }

    stack._stack.pop();

    const previous = stack._stack[stack._stack.length - 1];
    await stack.assign(previous);

    stack.button();
  },
};

let state: "loading" | "ready" | undefined = undefined;
document.addEventListener("DOMContentLoaded", async function () {
  if (state !== undefined) {
    return;
  }

  state = "loading";

  ui.initialize();
  (window as any)._navigate = (boad: string) => {
    stack.push(boad).then(() => {});
  };

  WebApp.ready();
  WebApp.BackButton.onClick(() => {
    stack.pop().catch(() => {});
  });

  try {
    let id = WebApp.initDataUnsafe.start_param;

    const searchParams = new URLSearchParams(window.location.search);
    const searchParamsID = searchParams.get("id");
    if (searchParamsID) {
      id = `id${searchParamsID}`;
    }

    if (!id) {
      const _id = WebApp.initDataUnsafe.user?.id;
      if (_id) {
        id = `id${_id}`;
      } else {
        throw new Error("Invalid user");
      }
    }

    await stack.push(id);
  } catch (error) {
    ui.error.show(error, false);
  }

  state = "ready";
});
