import { For, createEffect } from "solid-js";
import { Char } from "../../../api/list";
import CharCard from "../char/Card";
import { CharFilterValue } from "../nav/Filter";
import { ShowAllValue } from "../nav/ShowAllButton";
import { CharSortValue } from "../nav/Sort";
import { createSignal } from "solid-js";

export default (props: {
  filter?: (char: Char) => boolean;
  sort?: (a: Char, b: Char) => number;
  cut?: number;
  characters: Char[];
}) => {
  const [charV, charS] = createSignal(props.characters);
  createEffect(() => {
    const s = CharSortValue();
    const f = CharFilterValue();
    const cut = ShowAllValue();

    charS(
      props.characters
        .sort(s?.fn)
        .filter(f)
        .slice(0, cut ? 250 : props.characters.length)
    );
  });

  return (
    // let cards grow to fill the space but wrap so we still have multiple per row
    <div id="list" class="flex flex-row justify-center gap-6 flex-wrap">
      <For each={charV()} fallback={fallback}>
        {(char: Char) => (
          <div class="max-w-120 w-64 flex-grow">
            <CharCard char={char} colored={false} />
          </div>
        )}
      </For>
    </div>
  );
};

const fallback = (
  <div class="text-2xl text-center text-text col-span-full">
    No characters to display :(
  </div>
);
