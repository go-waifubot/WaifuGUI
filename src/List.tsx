import { useParams } from "@solidjs/router";
import { createResource, Show } from "solid-js";
import list from "./api/list";
import NavBar from "./components/list/Nav";
import ProfileBar from "./components/list/Profile";
import FilterBar from "./components/list/FilterBar";
import CharGrid from "./components/list/char/CharGrid";

export default () => {
  const { id } = useParams();
  const [user] = createResource(id, async () => {
    const { data: user, error } = await list(id);
    if (error) {
      console.error(error);
      return;
    }

    return user;
  });

  return (
    <Show when={!user.loading}>
      <main class="bg-base min-h-screen flex flex-col text-text">
        <div class="flex flex-col gap-8 w-full text-text rounded-b-12 bg-crust">
          <div class="flex flex-col gap-12 p-8 mx-auto max-w-7xl">
            {/* <NavBar /> */}
            <ProfileBar
              favorite={user()?.favorite!}
              about={user()?.quote!}
              user={user()?.id}
              anilist_url={user()?.anilist_url}
            />
            <FilterBar />
          </div>
        </div>
        <div class="max-w-400 py-8 sm:p-8 mx-auto">
          <CharGrid characters={user()?.waifus || []} />
        </div>
      </main>
    </Show>
  );
};
