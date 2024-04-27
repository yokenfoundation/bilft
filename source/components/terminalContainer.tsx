import Styled from "styled-components";
import React from "react";
import type { ApplicationContext } from "@/context/context";

const DOMTerminalContainer = Styled.div.attrs({ className: "container" })`
`;

interface ITerminalContainer {
  context: ApplicationContext;
  children?: React.ReactNode;
}

const TerminalContainer: React.FC<ITerminalContainer> = (p) => {
  return <DOMTerminalContainer>{p.children}</DOMTerminalContainer>;
};

export default TerminalContainer;
