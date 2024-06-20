import { initThemeParams, initUtils, retrieveLaunchParams } from "@tma.js/sdk";

export type StyleProps = {
  class?: string;
};

const launchParams = retrieveLaunchParams();
export const authData = launchParams.initDataRaw;
export const [themeParams] = initThemeParams();
export const utils = initUtils();
export const platform = launchParams.platform;

export const clsxString = (...items: string[]) => {
  let res = "";
  for (const it of items) {
    if (it.length === 0) {
      continue;
    }

    if (res.length > 0) {
      res += " ";
    }
    res += it;
  }

  return res;
};

export const addPrefix = (id: string) => (id.startsWith("id") ? id : `id${id}`);
export const removePrefix = (id: string) =>
  id.startsWith("id") ? id.slice(2) : id;

export function getProfileId() {
  const searchParams = new URLSearchParams(window.location.search);
  const searchParamsID = searchParams.get("id");
  if (searchParamsID) {
    return addPrefix(searchParamsID);
  }

  {
    const startParamId = launchParams.initData?.startParam;
    if (startParamId) {
      return startParamId;
    }
  }

  {
    return addPrefix(getSelfUserId());
  }
}
export const getProfileIdWithoutPrefix = () => removePrefix(getProfileId());

export const isEqualIds = (a: string, b: string) => {
  const aStrip = a.slice(a.startsWith("id") ? 2 : 0);
  const bStrip = b.slice(b.startsWith("id") ? 2 : 0);

  return aStrip === bStrip;
};

export const getSelfUserId = () => {
  const id = launchParams.initData?.user?.id;
  if (!id) {
    throw new Error("Invalid user");
  }
  return id.toString();
};
export const getBoardId = getProfileIdWithoutPrefix;

declare const _symbol: unique symbol;
export type Opaque<T, TTag> = T & {
  [_symbol]: TTag;
};

export type DateString = Opaque<string, "DateString">;
