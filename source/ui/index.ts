import WebApp from "@/telegram/index";
import model from "@/model";
import jq from "jquery";

namespace ui {
  export function initialize() {
    jq(document).on("scroll", function () {
      const element = document.activeElement;
      if (element && element instanceof HTMLElement) {
        element.blur();
      }
    });
  }
}

namespace ui {
  export const header = {
    loading(flag: boolean) {
      jq("#loading-indicator").css("display", flag ? "block" : "none");
    },
    update: (board: model.Board) => {
      if (board.name) {
        jq("#iuser").attr("href", `https://t.me/${board.name}`);
      } else {
        jq("#iuser").attr("href", ``);
      }

      if (board.isme) {
        jq("#iuser").text(`bilft@me`);
      } else {
        const _username = board.name ?? `id${board.id}`;
        jq("#iuser").text(`bilft@${_username}`);
      }
    },
  };
}

namespace ui {
  export const error = {
    id: undefined,
    show: (error?: string | any) => {
      clearTimeout(error.id);

      let message = "something wet wrong";
      if (error && typeof error === "string") {
        message = error;
      } else if ("message" in error && typeof error.message === "string") {
        message = error.message;
      }

      jq("#header-error").find("#alert").text(message);
      jq("#header-error").show(0.21);

      error.id = setTimeout(() => {
        jq("#header-error").hide(0.21);
      }, 3000);
    },
  } as { id: Timer | undefined; show: (text?: string | any) => void };
}

namespace ui {
  let _is_textarea_active: boolean = false;
  export const send = {
    active: (): boolean => {
      return _is_textarea_active;
    },
    data: () => {
      return jq("#send-data")
        .serializeArray()
        .reduce((previous, current) => {
          const data = {} as any;
          data[`${current.name}`] = current.value;
          return { ...previous, ...data };
        }, {}) as { content: string };
    },
    enable: () => {
      jq("#send-data").find("#textarea").fadeTo(0.12, 1);
      jq("#send-data").find("#textarea").prop("disabled", false);
    },
    disaable: () => {
      jq("#send-data").find("#textarea").fadeTo(0.12, 0.5);
      jq("#send-data").find("#textarea").prop("disabled", true);
    },
    clear: () => {
      jq("#send-data").find("#textarea").val("");
    },
    onactive: (callback: (active: boolean) => void) => {
      jq("#send-data")
        .find("#textarea")
        .on("focus", () => {
          _is_textarea_active = true;
          callback(true);
        });

      jq("#send-data")
        .find("#textarea")
        .on("blur", () => {
          _is_textarea_active = false;
          callback(false);
        });
    },
    onchange: (callabck: (content: string) => void) => {
      jq("#send-data")
        .find("#textarea")
        .on("input propertychange", () => {
          callabck(send.data().content);
        });
    },
  };
}

namespace ui {
  export const footer = {
    text: (text?: string) => {
      if (text && text.length > 0) {
        jq("#footer").show();
        jq("#footer").find("#alert").text(text);
      } else {
        jq("#footer").hide();
        jq("#footer").find("#alert").text("");
      }
    },
  };
}

namespace ui {
  const _timeline = {
    noteHTML: (note: model.Note): string => {
      let click = "";
      if (note.author.url) {
        click = `onclick="Telegram.WebApp.openTelegramLink('${note.author.url}')`;
      }
      return `
      <div class="terminal-card" ${click}">
      <header>${note.author.name}</header>
        <div>${note.content}</div>
      </div>`;
    },
  };

  export const timeline = {
    prepend: (array: model.NoteArray) => {
      array.data.reverse().forEach((i) => {
        jq("#timeline").prepend(_timeline.noteHTML(i));
      });
    },
    append: (array: model.NoteArray) => {
      array.data.forEach((i) => {
        jq("#timeline").append(jq(_timeline.noteHTML(i)));
      });
      timeline.footer(array);
    },
    replace: (array: model.NoteArray) => {
      timeline.clear();
      timeline.append(array);
      timeline.footer(array);
    },
    clear: () => {
      jq("#timeline").empty();
    },
    footer: (array: model.NoteArray) => {
      if (array.data.length == 0) {
        ui.footer.text("No one has written an note yet. Be frist!");
      } else if (array.next === undefined) {
        ui.footer.text("The end");
      } else {
        ui.footer.text("...");
      }
    },
  };
}

namespace ui {
  let previous_callback: (() => void) | undefined;
  export const button = {
    update: (state: "share" | "send" | "sending" | "hidden") => {
      const _button = WebApp.MainButton;
      switch (state) {
        case "send":
          _button.setText("Send");
          _button.hideProgress();
          _button.show();
          break;
        case "sending":
          _button.showProgress();
          _button.setText("Sending..");
          _button.show();
          break;
        case "share":
          _button.setText("Share");
          _button.hideProgress();
          _button.show();
          break;
        case "hidden":
          _button.hideProgress();
          _button.hide();
          break;
      }
    },
    click: (callback: () => void) => {
      const _button = WebApp.MainButton;
      if (previous_callback) {
        _button.offClick(previous_callback);
      }

      previous_callback = callback;
      _button.onClick(callback);
    },
  };
}

namespace ui {
  export const cursor = {
    onvisibleonce: (callback: () => void) => {
      const handler = function () {
        const cursor = jq("#cursor");
        if (!cursor) {
          return;
        }

        const elementTop = jq(cursor).offset()!.top;
        const elementBottom = elementTop + jq(cursor).outerHeight()!;

        const viewportTop = jq(window).scrollTop()!;
        const viewportBottom = viewportTop + jq(window).height()!;

        if (elementBottom > viewportTop && elementTop < viewportBottom) {
          jq(window).off("resize.cursor scroll.cursor");
          callback();
        }
      };

      jq(window).on("resize.cursor scroll.cursor", handler);
    },
  };
}

export default ui;
