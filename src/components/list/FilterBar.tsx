import { CharFilter } from "./nav/Filter";
import ShowAllButton from "./nav/ShowAllButton";
import { CharSort } from "./nav/Sort";

export default () => {
  return (
    <div class="flex rounded-xl flex-row flex-wrap md:flex-nowrap gap-8 justify-between h-full">
      <CharFilter class="w-full" />
      <CharSort class="w-full full:w-48" />
      <ShowAllButton class="w-full md:w-48" />
    </div>
  );
};
