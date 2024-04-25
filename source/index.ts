import "./polyfill";

import WebApp from "@/telegram/index";
import ui from "./ui";
import api from "./api";

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

let state: "loading" | "ready" | undefined = undefined;
document.addEventListener("DOMContentLoaded", async function () {
  if (state !== undefined) {
    return;
  }

  state = "loading";

  ui.initialize();

  ui.footer.text(undefined);
  ui.header.loading(true);

  WebApp.ready();
  try {
    let id = WebApp.initDataUnsafe.start_param;
    const qp = new URLSearchParams(window.location.search);
    const qpid = qp.get("id");
    if (qpid) {
      id = `id${qpid}`;
    }

    const board = await api.board.resolve({ board: id });
    ready(board.id);

    ui.header.update(board);
    ui.timeline.replace(board.notes);
    ui.cursor.onvisibleonce(() => {
      if (!board.notes.next) {
        return;
      }
      load(board.id, board.notes.next);
    });
  } catch (error) {
    ui.error.show(error, false);
  } finally {
    ui.header.loading(false);
  }

  state = "ready";
});
