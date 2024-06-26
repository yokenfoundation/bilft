import { createSignal } from "solid-js";

let maxScreenSize = 0;
const [isKeyboardOpen, setIsKeyboardOpen] = createSignal(false);
export { isKeyboardOpen };

const orientation = window.matchMedia("(orientation: portrait)");

export const onStableSizeChange = (height: number) => {
  if (!orientation.matches) {
    setIsKeyboardOpen(false);
    return;
  }
  if (maxScreenSize < height) {
    maxScreenSize = height;
  }
  setIsKeyboardOpen(maxScreenSize * 0.8 > height);
};
