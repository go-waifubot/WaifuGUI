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
        p-4
        focus:outline-none
        bg-base
        placeholder:font-sans
        rounded-md
        border-blue
        hover:cursor-text
        placeholder:text-overlayA
        text-text
        overflow-clip
        "
      classList={{
        [props.class!]: !!props.class,
      }}
    />
  );
};
