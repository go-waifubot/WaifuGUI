import { CharFilter } from "./nav/Filter";
import ShowAllButton from "./nav/ShowAllButton";
import { CharSort } from "./nav/Sort";
import Icon from "/src/assets/icon.png";

export default () => {
  return (
    <div
      class="gap-8 grid"
      style={{
        "grid-auto-flow": "column",
        "grid-template-columns": "min-content auto min-content",
      }}
    >
      <a href="/" class="w-16 h-16 min-w-max">
        <img src={Icon} class="w-16 h-16" />
      </a>
      <div class="grid gap-6 items-baseline grid-cols-2 max-w-full w-full">
        <CharFilter />
        <CharSort />
      </div>
      <div class="w-24 h-24 min-w-max ">
        <ShowAllButton />
      </div>
    </div>
  );
};
