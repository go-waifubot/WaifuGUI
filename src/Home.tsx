import { useNavigate, type Navigator } from "@solidjs/router";
import { getUser } from "./api/list";
import GhostButton from "./components/generic/GhostButton";
import Icon from "/src/assets/icon.png";

const userOrList = async (nav: Navigator, id: string) => {
  if (id.match(/\d{6,}/)) return nav(`/list/${id}`);
  const { data: user, error } = await getUser(id);
  if (error) {
    console.error(error);
    return;
  }

  if (user.id) return nav(`/list/${user.id}`);
};

export default () => {
  let inputref: HTMLInputElement = {} as HTMLInputElement;
  const nav = useNavigate();

  const Bar = () => (
    <div class="flex flex-col gap-2">
      <label class="text-sm">Discord ID</label>
      <input
        class="rounded-md border-none font-sans max-w-full bg-base text-text p-4 focus:outline-none"
        type="text"
        name="user-input"
        alt="user-input"
        placeholder="206794847581896705"
        ref={inputref}
        onKeyPress={(e) => e.key === "Enter" && userOrList(nav, inputref.value)}
      />
    </div>
  );

  return (
    <main class="bg-base h-screen w-screen font-sans selection:bg-overlayC">
      <div class="flex flex-col gap-16 pt-36 items-center justify-center text-text">
        <img src={Icon} alt="icon" />
        <div class="flex flex-row gap-6 items-end bg-mantle p-6 rounded-xl">
          <Bar />
          <GhostButton
            onClick={() => userOrList(nav, inputref.value)}
            type="submit"
            class="h-13"
          >
            Search
          </GhostButton>
        </div>
      </div>
    </main>
  );
};
