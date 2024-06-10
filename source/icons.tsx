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

export const CloseIcon = (props: ComponentProps<"svg">) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM7.79289 7.79289C8.18342 7.40237 8.81658 7.40237 9.20711 7.79289L12 10.585L14.7929 7.79289C15.1534 7.43241 15.7206 7.40468 16.1129 7.7097L16.2071 7.79289C16.5976 8.18342 16.5976 8.81658 16.2071 9.20711L13.415 12L16.2071 14.7929C16.5676 15.1534 16.5953 15.7206 16.2903 16.1129L16.2071 16.2071C15.8166 16.5976 15.1834 16.5976 14.7929 16.2071L12 13.415L9.20711 16.2071C8.84662 16.5676 8.27939 16.5953 7.8871 16.2903L7.79289 16.2071C7.40237 15.8166 7.40237 15.1834 7.79289 14.7929L10.585 12L7.79289 9.20711C7.43241 8.84662 7.40468 8.27939 7.7097 7.8871L7.79289 7.79289Z"
      fill="currentColor"
    />
  </svg>
);

export const ArrowPointDownIcon = (props: ComponentProps<"svg">) => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M2.15557 2.2952C2.40812 1.96688 2.879 1.90546 3.20732 2.15801L6.00004 4.30625L8.79275 2.15801C9.12107 1.90546 9.59196 1.96688 9.84451 2.2952C10.0971 2.62351 10.0356 3.0944 9.70732 3.34695L6.45732 5.84695C6.18773 6.05432 5.81234 6.05432 5.54275 5.84695L2.29275 3.34695C1.96444 3.0944 1.90302 2.62351 2.15557 2.2952Z"
      fill="currentColor"
    />
  </svg>
);

export const ArrowUpIcon = (props: ComponentProps<"svg">) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28ZM14.6498 7.37729C14.48 7.20016 14.2453 7.1 14 7.1C13.7547 7.1 13.52 7.20016 13.3502 7.37729L8.35021 12.5947C8.00629 12.9535 8.01842 13.5233 8.37729 13.8672C8.73615 14.2111 9.30587 14.199 9.64979 13.8401L13.1 10.2399V20C13.1 20.4971 13.5029 20.9 14 20.9C14.4971 20.9 14.9 20.4971 14.9 20V10.2399L18.3502 13.8401C18.6941 14.199 19.2638 14.2111 19.6227 13.8672C19.9816 13.5233 19.9937 12.9535 19.6498 12.5947L14.6498 7.37729Z"
      class="transition-[fill]"
    />
  </svg>
);

export const ArrowPointUp = (props: ComponentProps<"svg">) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 10L8 5L13 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);
