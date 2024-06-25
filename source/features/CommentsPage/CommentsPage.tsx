import type { Note } from "@/api/model";
import { assertOk } from "@/common";
import { useSearchParams } from "@solidjs/router";

export const CommentsPage = () => {
  const [searchParams] = useSearchParams();
  assertOk(searchParams.note);
  // [TODO]: add validation
  const note = JSON.parse(searchParams.note) as Note;

  return <div class="overflow-x-hidden">{JSON.stringify(note)}</div>;
};
