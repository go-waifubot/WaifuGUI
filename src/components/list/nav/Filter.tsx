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
  const [getV, setV] = createSignal("");
  return (
    <Input
      placeholder="Korone Inugami"
      class={classList}
      onInput={(v: string) => {
        setV(v);
        charFilterSet(() => filterFn(getV()));
      }}
      icon={
        <span
          class="i-ph-magnifying-glass"
          classList={{
            "text-emerald": !!getV(),
          }}
        ></span>
      }
    ></Input>
  );
};
