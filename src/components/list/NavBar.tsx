import { CharFilter } from "./nav/Filter";
import ShowAllButton from "./nav/ShowAllButton";
import { CharSort } from "./nav/Sort";
import YMDImage from "/src/assets/YMD.png";

export default (props: { setChars: any }) => {
  return (
    <div class="py-8">
      <a
        class="text-pink-400 text-2xl text-center flex flex-col gap-4 items-center"
        href="/"
      >
        <img src={YMDImage} class="w-24" />
        WaifuGUI
      </a>
      <div class="mx-4 gap-2 flex flex-col">
        <CharFilter />
        <CharSort />
        <ShowAllButton />
      </div>
    </div>
  );
};
