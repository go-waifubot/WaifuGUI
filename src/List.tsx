import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "solid-app-router";
import Fa from "solid-fa";
import { createResource, createSignal, Show } from "solid-js";
import { createGlobalStyles } from "solid-styled-components";
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
      <Layout />
      <main class="bg-neutral-900 min-h-screen">
        <nav class="bg-neutral-800">
          <NavBar setChars={setChars} />
        </nav>
        <div id="content" class="my-4 px-4">
          <CharGrid characters={chars()} />
        </div>
        <div id="profile" class="bg-neutral-800">
          <ProfileBar
            favorite={userProfile.favorite}
            about={userProfile.quote}
            user={userProfile.id}
          />
        </div>
        <a
          class="fixed rounded-full w-10 h-10 right-3 bottom-3 backdrop-brightness-125"
          title="Go to top"
          onClick={() => window.scrollTo({ left: 0, top: 0 })}
        >
          <Fa
            icon={faAnglesUp}
            color="rgb(244 114 182)"
            translateX={0.9}
            translateY={0.8}
          />
        </a>
      </main>
    </Show>
  );
};

const Layout = createGlobalStyles`
main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto;
  width: 100%;
}

#profile {
  max-width: 20rem;
}

@media (max-width: 768px) {
  main {
    grid-template-columns: auto;
    grid-template-rows: auto 1fr auto;
  }

  #profile {
    grid-row: 2;
    max-width: 100%;
    padding: 0 1rem;
  }
  #top {
    display: none;
  }
}
`;
