import CompareUser from "./nav/CompareUser";
import { CharFilter } from "./nav/Filter";
import ShowAllButton from "./nav/ShowAllButton";
import { CharSort } from "./nav/Sort";

export default () => {
  return (
    <div class="flex flex-col md:gap-4 gap-8">
      <div class="flex rounded-xl flex-row flex-wrap md:flex-nowrap gap-8 justify-between">
        <CharFilter class="w-full h-full" />
        <div class="w-full md:w-96 flex flex-row gap-8">
          <CharSort class="w-full" />
          <ShowAllButton class="w-36" />
        </div>
      </div>
      <div class="flex rounded-xl flex-row flex-wrap md:flex-nowrap gap-8 justify-between">
        <CompareUser class="w-full" />
      </div>
    </div>
  );
};
