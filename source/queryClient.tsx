import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/solid-query";
import { isAxiosError } from "axios";
import type { ParentProps } from "solid-js";
import { toast } from "solid-sonner";

/**
 *
 * extract message. error can have shape: {
 *   error: {
 *     message: string;
 *   };
 * }
 */
const getErrorMessage = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return "Unknown error";
  }
  const err = error as { error?: { message?: unknown } };
  if (typeof err.error !== "object" || err.error === null) {
    return "Unknown error";
  }

  const { message } = err.error;
  if (typeof message !== "string") {
    return "Unknown error";
  }

  return message;
};

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      if (!isAxiosError(error)) {
        toast.error("Unknown error");
        console.error("unknown error", error);
        return;
      }
      const resp = error.response;
      if (error.code === "ERR_NETWORK") {
        toast.error("Network error, check your connection");
        return;
      }
      if (!resp) {
        toast.error("Unknown error");
        console.error(error);
        return;
      }
      if (resp.status >= 500) {
        toast.error("Server error, try again later");
        return;
      }
      if (resp.status >= 400) {
        toast.error(getErrorMessage(resp.data));
        return;
      }
    },
  }),
});

export const AppQueryClientProvider = (props: ParentProps) => (
  <QueryClientProvider client={queryClient}>
    {props.children}
  </QueryClientProvider>
);
