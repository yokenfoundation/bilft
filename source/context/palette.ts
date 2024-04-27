interface PaletteData {
  accent: string;
  text: {
    primary: string;
  };
}

export const PaletteDataDefault: PaletteData = {
  accent: "#BF4F74",
  text: {
    primary: "",
  },
};

export { type PaletteData };
