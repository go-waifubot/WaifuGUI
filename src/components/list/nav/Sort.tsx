import { createSignal } from "solid-js";
import { Char } from "../../../api/list";
import DropDown from "../../generic/DropDown";

const fns = [
  {
    name: "Date",
    value: "date",
    fn: (a: Char, b: Char) =>
      b.date && a.date
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : -1,
  },
  {
    name: "Name",
    value: "name",
    fn: (a: Char, b: Char) => a.name.localeCompare(b.name),
  },
  {
    name: "ID",
    value: "id",
    fn: (a: Char, b: Char) => Number(a.id) - Number(b.id),
  },
];

type SortFn = (typeof fns)[number];

const [charSortValue, charSortSet] = createSignal<SortFn>(fns[0]);

export const CharSortValue = charSortValue;

export const CharSort = ({ class: className }: { class?: string }) => {
  return (
    <DropDown
      class={className}
      value={() => charSortValue().name}
      options={fns.map((f) => ({ value: f.value, label: f.name }))}
      onChange={(e: string) => {
        // find existing function.
        // if it's the same one, reverse the sort.
        // otherwise, set the new one.
        const sorter = fns.find((f) => f.value === e)!;
        if (
          sorter &&
          charSortValue() &&
          sorter?.value === charSortValue()?.value
        ) {
          charSortSet((prev: any) => {
            return {
              ...prev!,
              fn: (a: Char, b: Char) => prev?.fn(b, a),
            };
          });
          return;
        }

        charSortSet(() => sorter);
      }}
    />
  );
};
