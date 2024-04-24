import { type WebApp } from "@twa-dev/types";

interface TelegramWindow {
  Telegram: {
    WebApp: WebApp;
  };
}

const _window = window as unknown as TelegramWindow;

export * from "@twa-dev/types";
export default _window.Telegram.WebApp;
