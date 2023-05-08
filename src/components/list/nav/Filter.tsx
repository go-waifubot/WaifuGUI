import { createSignal } from "solid-js";
import type { Char } from "../../../api/list";
import { Input } from "../../generic/Input";

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
    <Input
      placeholder="Filter characters"
      class={classList}
      onInput={(v: string) => {
        charFilterSet(() => filterFn(v));
      }}
      icon={<span class="i-ph-magnifying-glass"></span>}
    ></Input>
  );
};
