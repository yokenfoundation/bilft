import { Buffer } from "buffer/";

declare interface PolyfillWindow {
  Buffer: any;
}

let _window: PolyfillWindow;
_window = globalThis.window as any as PolyfillWindow;

if (_window.Buffer === undefined) {
  _window.Buffer = Buffer;
}
