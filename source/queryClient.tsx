import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import type { ParentProps } from "solid-js";

export const queryClient = new QueryClient();

export const AppQueryClientProvider = (props: ParentProps) => (
  <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
);
