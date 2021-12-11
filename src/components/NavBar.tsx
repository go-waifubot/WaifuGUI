import { CharFilter } from "./nav/Filter";
import ShowAllButton from "./nav/ShowAllButton";
import { CharSort } from "./nav/Sort";

export default () => {
  return (
    <nav class="p-2 h-16 flex flex-row flex-grow content-center fixed w-full z-10 bg-green-300 shadow-sm shadow-green-400">
      <a class="flex justify-center content-center min-w-fit" href="/">
        <img src="/src/assets/YMD.png" alt="icon" />
      </a>

      <div
        id="nav-opts"
        class="grid grid-flow-col gap-3 justify-center content-center w-full"
      >
        <CharFilter />
        <CharSort />
      </div>
      <ShowAllButton />
    </nav>
  );
};
