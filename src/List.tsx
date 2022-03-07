import { useParams } from "solid-app-router";
import { createResource, createSignal, Show } from "solid-js";
import list, { Char, User } from "./api/list";
import CharGrid from "./components/list/char/CharGrid";
import NavBar from "./components/list/NavBar";
import ProfileBar from "./components/list/ProfileBar";

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
      <main
        class="grid gap-4 bg-neutral-900
        sm:grid-cols-1
        grid-cols-1
        
        sm:grid-rows-3 
        grid-rows-3"
        style={{
          "grid-template-columns":
            window.screen.width < 768 ? "auto" : "repeat(3,auto)",
          "grid-template-rows": "auto",
        }}
      >
        <nav class="md:w-64 lg:w-100 sm:h-min">
          <div class="md:fixed md:h-screen sm:h-min md:w-64 bg-neutral-800">
            <NavBar setChars={setChars} />
          </div>
        </nav>
        <div id="content" class="align-baseline my-8">
          <section about="list" class="px-4">
            <CharGrid characters={chars()} />
          </section>
        </div>
        <div id="profile" class="md:w-96 lg:w-100 h-min">
          <div class="md:fixed md:h-screen md:w-96 bg-neutral-800 md:right-0">
            <ProfileBar
              favorite={userProfile.favorite}
              about={userProfile.quote}
              user={userProfile.id}
            />
          </div>
        </div>
      </main>
    </Show>
  );
};
