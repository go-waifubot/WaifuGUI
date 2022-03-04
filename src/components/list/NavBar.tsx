import { useNavigate } from "solid-app-router";
import list from "../../api/list";
import GhostButton from "../generic/GhostButton";
import { CharFilter } from "./nav/Filter";
import ShowAllButton from "./nav/ShowAllButton";
import { CharSort } from "./nav/Sort";

export default (props: { setChars: any }) => {
  let inputref: HTMLInputElement = {} as HTMLInputElement;
  const nav = useNavigate();

  return (
    <nav class="p-2 h-16 flex flex-row flex-grow content-center fixed w-full z-10 bg-green-300">
      <a class="flex justify-center content-center min-w-fit" href="/">
        <img src="/src/assets/YMD.png" alt="icon" />
      </a>

      <div
        id="nav-opts"
        class="grid grid-flow-col gap-5 justify-center content-center w-full"
      >
        <div class="flex gap-1">
          <input
            type="text"
            placeholder="Lookup User"
            ref={inputref}
            class="flex
          focus:outline-none
          focus:ring-0
          focus:border-white
          justify-center
          bg-inherit
          rounded-md
          border-2
          border-neutral-800
          text-neutral-800
          placeholder:text-neutral-600
          overflow-hidden
          p-2"
          />
          <GhostButton
            type="submit"
            onClick={async () => {
              nav(`/list/${inputref.value}`);
              const user = await list(inputref.value);
              props.setChars(user.waifus);
            }}
          >
            Go
          </GhostButton>
        </div>
        <CharFilter />
        <CharSort />
      </div>
      <ShowAllButton />
    </nav>
  );
};
