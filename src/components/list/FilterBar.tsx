import { CharFilter } from "./nav/Filter";
import ShowAllButton from "./nav/ShowAllButton";
import { CharSort } from "./nav/Sort";

export default () => {
  return (
    <div class="flex flex-row flex-wrap md:flex-nowrap gap-8 bg-neutral-900 justify-between shadow-4xl">
      <CharFilter class="w-full" />
      <CharSort class="w-48" />
      <ShowAllButton class="w-48" />
    </div>
  );
};
