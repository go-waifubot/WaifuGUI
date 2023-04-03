import { useNavigate, type Navigator } from "solid-app-router";
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

  return (
    <main class="bg-neutral-900 h-screen w-screen selection:bg-zinc-700">
      <div class="flex flex-col gap-16 pt-36 items-center justify-center text-white">
        <img src={Icon} alt="icon" class="m-auto" />
        <div class="p-8 flex flex-row gap-6">
          <label for="user-input">
            Discord ID
            <input
              class="bg-inherit border-b-2 border-b-orange-400 hover:border-b-orange-50 focus-visible:b-orange-50 ml-2 p-3 w-64 focus:outline-none"
              type="text"
              name="user-input"
              alt="user-input"
              placeholder="206794847581896705"
              ref={inputref}
              onKeyPress={(e) =>
                e.key === "Enter" && userOrList(nav, inputref.value)
              }
            />
          </label>
          <GhostButton
            onClick={() => userOrList(nav, inputref.value)}
            type="submit"
          >
            Search
          </GhostButton>
        </div>
      </div>
    </main>
  );
};
