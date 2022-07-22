import { useNavigate } from "solid-app-router";
import GhostButton from "./components/generic/GhostButton";
import Icon from "/src/assets/icon.png";

export default () => {
  let inputref: HTMLInputElement = {} as HTMLInputElement;
  const nav = useNavigate();

  return (
    <main class="bg-neutral-900 h-screen w-screen selection:bg-zinc-700">
      <div class="flex flex-col gap-16 pt-36 items-center justify-center text-white">
        <img src={Icon} alt="icon" class="m-auto" />
        <div class="p-8 flex flex-row gap-6">
          <input
            class="bg-inherit border-b-2 border-b-orange-400 hover:border-b-orange-50 focus-visible:b-orange-50 p-3 w-64"
            type="text"
            name="user-input"
            alt="user-input"
            placeholder="206794847581896705"
            ref={inputref}
          />
          <GhostButton
            onClick={() => {
              if (inputref.value && inputref.value.length > 8)
                nav(`/list/${inputref.value}`);
            }}
            type="submit"
          >
            Search
          </GhostButton>
        </div>
      </div>
    </main>
  );
};
