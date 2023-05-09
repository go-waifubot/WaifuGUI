import { For, createEffect } from "solid-js";
import { Char, CharOwned } from "../../../api/list";
import CharCard from "../char/Card";
import { CharFilterValue } from "../nav/Filter";
import { ShowAllValue } from "../nav/ShowAllButton";
import { CharSortValue } from "../nav/Sort";
import { createSignal } from "solid-js";
import { UserAgainst } from "../nav/CompareUser";
import { FilterCharacter, MediaCharacters } from "../nav/FilterMedia";

export default ({
  characters,
}: {
  filter?: (char: Char) => boolean;
  sort?: (a: Char, b: Char) => number;
  cut?: number;
  characters: Char[];
}) => {
  const [charV, charS] = createSignal<CharOwned[]>(characters as CharOwned[]);
  const [charM, charMSet] = createSignal<CharOwned[] | undefined>();
  createEffect(() => {
    const s = CharSortValue();
    const f = CharFilterValue();
    const cut = ShowAllValue();
    const f2 = FilterCharacter();
    const other = UserAgainst();
    const otherChars = (other?.waifus || []).map((char) => char.id);

    charS(
      characters
        .filter(f2)
        .filter(f)
        .sort(s?.fn)
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

    charMSet(() => {
      const m = MediaCharacters()
        ?.filter((char) => FilterCharacter()(char))
        .filter((char) => !charV().find((c) => c.id === char.id))
        .filter(f)
        .sort(s?.fn);
      if (!m) return;

      return m.map((char) => {
        if (otherChars) {
          return {
            ...char,
            owners: otherChars.includes(char.id) ? [other!.id] : undefined,
          } as CharOwned;
        } else {
          return char as CharOwned;
        }
      });
    });
  });

  return (
    // let cards grow to fill the space but wrap so we still have multiple per row
    <div id="list" class="flex flex-row justify-center gap-6 flex-wrap">
      <For each={charV()} fallback={<></>}>
        {(char: CharOwned) => (
          <div class="max-w-120 w-72 flex-grow">
            <CharCard char={char} multiOwned={!!char.owners} />
          </div>
        )}
      </For>
      <For each={charM()} fallback={<></>}>
        {(char: CharOwned) => (
          <div class="max-w-120 w-72 flex-grow">
            <CharCard char={char} multiOwned={!!char.owners} missing={true} />
          </div>
        )}
      </For>
      {charV().length == 0 ? fallback : null}
    </div>
  );
};

const fallback = (
  <div class="text-2xl text-center text-text col-span-full">
    No characters to display :(
  </div>
);
