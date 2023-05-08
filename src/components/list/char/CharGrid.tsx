import { For, createEffect } from "solid-js";
import { Char, CharOwned } from "../../../api/list";
import CharCard from "../char/Card";
import { CharFilterValue } from "../nav/Filter";
import { ShowAllValue } from "../nav/ShowAllButton";
import { CharSortValue } from "../nav/Sort";
import { createSignal } from "solid-js";
import { UserAgainst } from "../nav/CompareUser";

export default ({
  characters,
}: {
  filter?: (char: Char) => boolean;
  sort?: (a: Char, b: Char) => number;
  cut?: number;
  characters: Char[];
}) => {
  const [charV, charS] = createSignal<CharOwned[]>(characters as CharOwned[]);
  createEffect(() => {
    const s = CharSortValue();
    const f = CharFilterValue();
    const cut = ShowAllValue();
    const other = UserAgainst();

    const otherChars = (other?.waifus || []).map((char) => char.id);

    charS(
      (characters as any)
        .sort(s?.fn)
        .filter(f)
        .slice(0, cut ? 100 : characters.length)
        .map((char: CharOwned) => {
          if (otherChars.includes(char.id)) {
            return {
              ...char,
              owners: [other!.id],
            };
          }

          return char;
        })
    );
  });

  return (
    // let cards grow to fill the space but wrap so we still have multiple per row
    <div id="list" class="flex flex-row justify-center gap-6 flex-wrap">
      <For each={charV()} fallback={fallback}>
        {(char: CharOwned) => (
          <div class="max-w-120 w-64 flex-grow">
            <CharCard char={char} multiOwned={!!char.owners} />
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
