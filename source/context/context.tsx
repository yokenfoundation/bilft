import React, { useCallback, useRef, useState } from "react";
import { type PaletteData, PaletteDataDefault } from "./palette";

type IPaletteContext = {
  current: PaletteData;
  update: React.Dispatch<React.SetStateAction<PaletteData>>;
};

type ApplicationContext = {
  loading: {
    active: () => boolean;
    increment: () => void;
    decrement: () => void;
  };
  palette: IPaletteContext;
};

const _ApplicationContext = React.createContext<ApplicationContext | undefined>(undefined);

interface IApplicationContextProvider {
  children?: React.ReactNode;
}

const ApplicationContextProvider: React.FC<IApplicationContextProvider> = (p) => {
  const [palette, setPalette] = useState(PaletteDataDefault);
  const [loadingCounter, setLoadingCounter] = useState(0);

  return (
    <_ApplicationContext.Provider
      value={{
        palette: { current: palette, update: setPalette },
        loading: {
          active: () => {
            return loadingCounter > 0;
          },
          increment: () => {
            setLoadingCounter((current) => {
              return current + 1;
            });
          },
          decrement: () => {
            setLoadingCounter((current) => {
              let target = current - 1;
              if (target < 0) target = 0;
              return target;
            });
          },
        },
      }}
    >
      {p.children}
    </_ApplicationContext.Provider>
  );
};

const useApplicationContext = (): ApplicationContext => {
  const paletteContext = React.useContext(_ApplicationContext);
  if (!paletteContext) {
    throw new Error("`useTheme` should be used inside ThemeProvider");
  }
  return paletteContext;
};

export * from "./palette";
export { useApplicationContext, type ApplicationContext };
export default ApplicationContextProvider;
