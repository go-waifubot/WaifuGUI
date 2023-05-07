import { createSignal, For } from "solid-js";
import { Char } from "../../../api/list";

const fns = [
  {
    name: "Date desc",
    fn: (a: Char, b: Char) =>
      -(new Date(a.date).getTime() - new Date(b.date).getTime()),
  },
  {
    name: "Date",
    fn: (a: Char, b: Char) =>
      new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  { name: "Name", fn: (a: Char, b: Char) => a.name.localeCompare(b.name) },
  {
    name: "Name desc",
    fn: (a: Char, b: Char) => -a.name.localeCompare(b.name),
  },
  { name: "ID", fn: (a: Char, b: Char) => a.id - b.id },
  { name: "ID desc", fn: (a: Char, b: Char) => -(a.id - b.id) },
];

const [charSortValue, charSortSet] = createSignal(fns[0].fn);

export const CharSortValue = charSortValue;

const sortFn =
  (name: string) =>
  (a: Char, b: Char): number =>
    fns.find((f) => f.name == name)?.fn(a, b) as number;

export const CharSort = (props: { class?: string }) => {
  return (
    <select
      onClick={(e) => charSortSet(() => sortFn(e.currentTarget.value))}
      class="
        flex
        focus:outline-none
        p-4
        bg-base
        rounded-md
        border-2
        hover:cursor-pointer
        border-blue
        placeholder:text-overlayA
        text-text
        overflow-clip
        "
      classList={{
        [props.class!]: !!props.class,
      }}
    >
      <For each={fns}>
        {(fn: { name: string; fn: (a: Char, b: Char) => number }) => (
          <option value={fn.name} class="bg-crust text-text">
            {fn.name}
          </option>
        )}
      </For>
    </select>
  );
};
