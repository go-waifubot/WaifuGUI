import { For } from "solid-js";
import { Char } from "../api/liste";
import CharCard from "./char/Card";
import { CharFilterValue } from "./nav/Filter";
import { ShowAllValue } from "./nav/ShowAllButton";
import { CharSortValue } from "./nav/Sort";

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
      class="container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4 justify-center"
    >
      <For
        each={chars()}
        fallback={
          <div class="text-5xl text-center text-green-300 col-span-full pt-48">
            No characters to display :(
          </div>
        }
      >
        {(char: Char) => <CharCard char={char} colored={false} />}
      </For>
    </div>
  );
};
