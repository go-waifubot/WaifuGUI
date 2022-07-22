import { useParams } from "solid-app-router";
import { createResource, createSignal, Show } from "solid-js";
import list, { Char, User } from "./api/list";
import CharGrid from "./components/list/char/CharGrid";
import NavBar from "./components/list/Nav";
import ProfileBar from "./components/list/Profile";

export default () => {
  const [chars, setChars] = createSignal<Char[]>([]);
  var userProfile: Partial<User> = {};

  async function loadUser(id: string) {
    const u = await list(id);
    setChars(u.waifus);
    userProfile = u;
  }

  const { id } = useParams();
  const [user] = createResource(id, loadUser);

  return (
    <Show when={!user.loading}>
      <main class="bg-neutral-900 min-h-screen flex justify-center px-8 py-16">
        <div
          class="flex flex-col gap-12 items-stretch justify-center text-white"
          style={{
            "max-width": "70rem",
            width: "100%",
          }}
        >
          <NavBar />
          <ProfileBar
            favorite={userProfile.favorite}
            about={userProfile.quote}
            user={userProfile.id}
          />
          <CharGrid characters={chars()} />
        </div>
      </main>
    </Show>
  );
};
