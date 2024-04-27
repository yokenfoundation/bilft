import Styled, { css } from "styled-components";
import React from "react";
import type { ApplicationContext, PaletteData } from "@/context/context";

const DOMTerminalContainerLoadingIndicator = Styled.div.attrs({ className: "container" })`
  position: fixed; 
  left: 0; 
  right: 0; 
  top: 0; 
  z-index: 9999
`;

const DOMLoadingIndicator = Styled.div`
  height: 2px;
  display: block;
  position: absolute;
  left: -1px;
  right: 0;
  top: 0px;
  overflow: hidden;
  line-height: 2px;

  &:after {
    content: "";
    width: 96px;
    height: 2px;
    background: var(--primary-color);
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    animation: slide 1.2s ease-in-out infinite alternate;
  }

  @keyframes slide {
    0% {
      left: 0;
      transform: translateX(-1%);
    }
    100% {
      left: 100%;
      transform: translateX(-99%);
    }
  }
`;

interface ILoadingIndicator {
  context: ApplicationContext;
  hidden: boolean;
}

const LoadingIndicator: React.FC<ILoadingIndicator> = (p) => {
  if (p.hidden) {
    return <DOMTerminalContainerLoadingIndicator />;
  }

  return (
    <DOMTerminalContainerLoadingIndicator>
      <DOMLoadingIndicator />
    </DOMTerminalContainerLoadingIndicator>
  );
};

export default LoadingIndicator;
