import { assertOk } from "@/common";
import {
  createContext,
  createEffect,
  createSignal,
  useContext,
  type ParentProps,
} from "solid-js";
import { useScreenSize } from "./screenSize";

let maxScreenSize = 0;
const orientation = window.matchMedia("(orientation: portrait)");

const useKeyboardStatusImpl = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = createSignal(false);

  const { height } = useScreenSize();

  createEffect(() => {
    height();

    if (!orientation.matches) {
      setIsKeyboardOpen(false);
      return;
    }
    if (maxScreenSize < height()) {
      maxScreenSize = height();
    }

    setIsKeyboardOpen(maxScreenSize * 0.8 > height());
  });

  return {
    isKeyboardOpen,
  };
};

const keyboardStatus = createContext<{
  isKeyboardOpen(): boolean;
} | null>(null);
export const KeyboardStatusProvider = (props: ParentProps) => (
  <keyboardStatus.Provider value={useKeyboardStatusImpl()}>
    {props.children}
  </keyboardStatus.Provider>
);

export const useKeyboardStatus = () => {
  const ctx = useContext(keyboardStatus);
  assertOk(ctx);

  return ctx;
};
