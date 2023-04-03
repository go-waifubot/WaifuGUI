import { useParams } from "solid-app-router";
import { createResource, Show } from "solid-js";
import List from "./components/list/List";
import list from "./api/list";
import NavBar from "./components/list/Nav";
import ProfileBar from "./components/list/Profile";

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
      <main class="bg-neutral-900 min-h-screen flex justify-center px-8 py-16">
        <div
          class="flex flex-col gap-12 items-stretch text-white"
          style={{
            "max-width": "70rem",
            width: "100%",
          }}
        >
          <NavBar />
          <ProfileBar
            favorite={user()?.favorite!}
            about={user()?.quote!}
            user={user()?.id}
            anilist_url={user()?.anilist_url}
          />
          <List characters={user()?.waifus ?? []} />
        </div>
      </main>
    </Show>
  );
};
