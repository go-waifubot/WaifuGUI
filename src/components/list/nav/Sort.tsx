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

export const CharSort = () => {
  return (
    <select
      onClick={(e) => charSortSet(() => sortFn(e.currentTarget.value))}
      class="
    flex
      focus:outline-none
      focus:ring-0
      focus:border-white
      bg-inherit
      rounded-md
      border-2
      border-neutral-800
      text-neutral-800
      p-2"
    >
      <For each={fns}>
        {(fn: { name: string; fn: (a: Char, b: Char) => number }) => (
          <option value={fn.name}>{fn.name}</option>
        )}
      </For>
    </select>
  );
};
