import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Fa from "solid-fa";
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

export const CharFilter = () => {
  return (
    <div class="inline-flex">
      <input
        type="text"
        onInput={(e) => {
          charFilterSet(() => filterFn(e.currentTarget.value));
        }}
        placeholder="Filter characters"
        class="
        flex
        focus:outline-none
        bg-inherit
        border-b-2
        border-pink-500
        placeholder:text-neutral-600
        text-neutral-100
        overflow-clip
        
        m-2
        p-2
        "
        value=""
      />
      <Fa icon={faSearch} color="white" translateY={1.2} />
    </div>
  );
};
