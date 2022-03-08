import { For } from "solid-js";
import { Char } from "../../../api/list";
import CharCard from "../char/Card";
import { CharFilterValue } from "../nav/Filter";
import { ShowAllValue } from "../nav/ShowAllButton";
import { CharSortValue } from "../nav/Sort";

export default (props: {
  filter?: (char: Char) => boolean;
  sort?: (a: Char, b: Char) => number;
  cut?: number;
  characters: Char[];
}) => {
  const chars = () => {
    const s = CharSortValue();
    const f = CharFilterValue();
    const cut = ShowAllValue();
    return props.characters
      .sort(s)
      .filter(f)
      .slice(0, cut ? 200 : props.characters.length);
  };
  return (
    <div
      id="list"
      class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <For each={chars()} fallback={fallback}>
        {(char: Char) => <CharCard char={char} colored={false} />}
      </For>
    </div>
  );
};

const fallback = () => {
  return (
    <div class="text-2xl text-center text-neutral-100 col-span-full pt-48">
      No characters to display :(
    </div>
  );
};
