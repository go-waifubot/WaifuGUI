import { Char } from "../../api/list";
import CharGrid from "./char/CharGrid";
import FilterBar from "./FilterBar";

export default (props: {
  filter?: (char: Char) => boolean;
  sort?: (a: Char, b: Char) => number;
  cut?: number;
  characters: Char[];
}) => {
  return (
    <div class="flex flex-col gap-6">
      <FilterBar />

      <CharGrid
        characters={props.characters}
        cut={props.cut}
        filter={props.filter}
        sort={props.sort}
      />
    </div>
  );
};
