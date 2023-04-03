import { createSignal } from "solid-js";
import type { Char } from "../../../api/list";

const filterFn = (v: string) => (a: Char) => {
  return (
    v.length < 2 ||
    a.id.toString().includes(v) ||
    (v.length >= 2 && a.name.toLowerCase().includes(v.toLowerCase()))
  );
};

const [charFilterValue, charFilterSet] = createSignal(filterFn(""));
export const CharFilterValue = charFilterValue;

export const CharFilter = (props: { class?: string }) => {
  return (
    <input
      type="text"
      onInput={(e) => {
        charFilterSet(() => filterFn(e.currentTarget.value));
      }}
      id="char-filter"
      placeholder="Filter characters"
      class="
        flex
        focus:outline-none
        bg-inherit
        border-b-2
        h-12
        border-orange-400
        hover:border-orange-50
        placeholder:text-neutral-600
        text-neutral-100
        overflow-clip
        "
      classList={{
        [props.class!]: !!props.class,
      }}
      value=""
    />
  );
};
