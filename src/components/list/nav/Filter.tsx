import { createSignal } from "solid-js";
import type { Char } from "../../../api/list";

const filterFn = (v: string) => (a: Char) => {
  return (
    v.length < 2 ||
    a.id.toString().includes(v) ||
    (v.length >= 2 && a.name.toLowerCase().includes(v))
  );
};

const [charFilterValue, charFilterSet] = createSignal(filterFn(""));
export const CharFilterValue = charFilterValue;

export const CharFilter = () => {
  return (
    <div className="search-input">
      <input
        type="text"
        onInput={(e) => {
          charFilterSet(() => filterFn(e.currentTarget.value ?? ""));
        }}
        placeholder="Filter characters"
        class="flex
      focus:outline-none
      focus:ring-0
      focus:border-white
      justify-center
      bg-inherit
      rounded-md
      border-2
      border-neutral-800
      text-neutral-800
      placeholder:text-neutral-600
      overflow-hidden
      p-2"
      />
    </div>
  );
};
