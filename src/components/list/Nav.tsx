import { CharFilter } from "./nav/Filter";
import ShowAllButton from "./nav/ShowAllButton";
import { CharSort } from "./nav/Sort";
import Icon from "/src/assets/icon.png";

export default () => {
  return (
    <div>
      <div class="grid grid-flow-col-dense gap-8">
        <a href="/" class="w-16 h-16">
          <img src={Icon} class="w-16 h-16 " />
        </a>
        <CharFilter />
        <CharSort />
        <ShowAllButton />
      </div>
    </div>
  );
};
