import { useNavigate } from "solid-app-router";

export default () => {
  let inputref: HTMLInputElement = {} as HTMLInputElement;
  const nav = useNavigate();

  return (
    <main class="bg-neutral-900 h-screen w-screen selection:bg-zinc-700">
      <div class="h-fullcontainer place-content-center text-white">
        <div>
          <h1 class="text-5xl p-8 text-center text-pink-400">WaifuGUI</h1>
        </div>
        <img src="src/assets/YMD.png" alt="icon" class="m-auto" />
        <div class="p-8 flex flex-row gap-2 justify-center items-center ">
          <input
            class="bg-inherit border-2 border-pink-500 rounded-md p-3 w-64"
            type="text"
            name="user-input"
            alt="user-input"
            placeholder="206794847581896705"
            ref={inputref}
          />
          <input
            type="button"
            value="Search"
            onClick={() => nav(`/list/${inputref.value}`)}
            class="p-3 rounded-md bg-pink-500 hover:bg-pink-600 text-white"
          />
        </div>
      </div>
    </main>
  );
};
