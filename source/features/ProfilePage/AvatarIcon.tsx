import { type StyleProps, clsxString } from "@/common";
import { createSignal, createComputed, Show } from "solid-js";

const isImageAlreadyLoaded = (imageSrc: string) => {
  const img = document.createElement("img");
  img.src = imageSrc;

  return img.complete;
};

export const AvatarIcon = (props: StyleProps & { isLoading: boolean; url: string | null; lazy?: boolean }) => {
  const [isImageLoaded, setIsImageLoaded] = createSignal(props.url ? isImageAlreadyLoaded(props.url) : false);

  createComputed((prev) => {
    if (props.url && props.url !== prev) {
      setIsImageLoaded(isImageAlreadyLoaded(props.url));
    }

    return props.url;
  });

  const isLoading = () => props.isLoading && !isImageLoaded();

  return (
    <div class={clsxString("aspect-square rounded-full overflow-hidden relative select-none", props.class ?? "")}>
      <div
        class={clsxString(
          "absolute inset-0 bg-gray-400 transition-opacity",
          isLoading() ? "animate-pulse" : props.url ? "opacity-0" : "",
        )}
      />
      <Show when={props.url}>
        {(url) => (
          <img
            loading={props.lazy ? "lazy" : "eager"}
            onLoadStart={() => {
              setIsImageLoaded(false);
            }}
            onLoad={() => {
              setIsImageLoaded(true);
            }}
            alt="Avatar"
            src={url()}
            class={clsxString("object-cover inset-0", isLoading() ? "opacity-0" : "")}
          />
        )}
      </Show>
    </div>
  );
};
