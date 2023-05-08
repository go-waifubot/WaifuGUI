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

export const CharFilter = ({ class: classList }: { class?: string }) => {
  return (
    <div
      rounded-md
      class="relative mr-6"
      classList={{
        [classList!]: !!classList,
      }}
    >
      <input
        type="text"
        onInput={(e) => {
          charFilterSet(() => filterFn(e.currentTarget.value));
        }}
        id="char-filter"
        placeholder="Filter characters"
        class="
        py-4
        px-2
        rounded-md
        focus:outline-none
        bg-base
        placeholder:font-sans
        border-blue
        hover:cursor-text
        placeholder:text-overlayA
        text-text
        overflow-clip
        "
        classList={{
          [classList!]: !!classList,
        }}
      ></input>
      <span class="i-ph-magnifying-glass self-center top-4.5 right-0 absolute"></span>
    </div>
  );
};
