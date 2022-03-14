import { faSort } from "@fortawesome/free-solid-svg-icons";
import Fa from "solid-fa";
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
    <div class="inline-flex w-100">
      <select
        onClick={(e) => charSortSet(() => sortFn(e.currentTarget.value))}
        class="
        flex
        w-full
        focus:outline-none
        bg-inherit
        border-b-2
        border-pink-500
        placeholder:text-neutral-600
        text-neutral-100
        overflow-clip
        my-2
        py-2
        "
      >
        <For each={fns}>
          {(fn: { name: string; fn: (a: Char, b: Char) => number }) => (
            <option value={fn.name} class="bg-neutral-900 text-neutral-200">
              {fn.name}
            </option>
          )}
        </For>
      </select>
      <div class="right-0">
        <Fa icon={faSort} color="white" translateY={1.2} />
      </div>
    </div>
  );
};
