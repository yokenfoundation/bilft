import type { ComponentProps } from "solid-js";
import { themeParams } from "./common";

export const YoCoinIcon = (props: ComponentProps<"svg">) =>
  themeParams.isDark ? (
    <svg width="82" height="82" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="82" height="82" rx="41" fill="white" />
      <rect
        x="0.2"
        y="0.2"
        width="81.6"
        height="81.6"
        rx="40.8"
        stroke="#545458"
        stroke-opacity="0.65"
        stroke-width="0.4"
      />
      <path
        d="M38.8821 45.4864L24.9697 21.8958H29.6072L41.0848 41.6029L52.3306 21.8958H57.0261L43.0558 45.4864V62.4693H38.8821V45.4864Z"
        fill="black"
      />
      <ellipse cx="40.9484" cy="21.899" rx="2.42401" ry="2.37504" fill="black" />
    </svg>
  ) : (
    <svg width="82" height="82" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="82" height="82" rx="41" fill="black" />
      <rect
        x="0.2"
        y="0.2"
        width="81.6"
        height="81.6"
        rx="40.8"
        stroke="#3C3C43"
        stroke-opacity="0.36"
        stroke-width="0.4"
      />
      <path
        d="M38.8821 45.4864L24.9697 21.8958H29.6072L41.0848 41.6029L52.3306 21.8958H57.0261L43.0558 45.4864V62.4693H38.8821V45.4864Z"
        fill="white"
      />
      <ellipse cx="40.9484" cy="21.899" rx="2.42401" ry="2.37504" fill="white" />
    </svg>
  );
