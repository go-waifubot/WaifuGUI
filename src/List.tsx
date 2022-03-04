import { useParams } from "solid-app-router";
import { createResource, createSignal, Show } from "solid-js";
import list, { Char } from "./api/list";
import CharGrid from "./components/list/CharGrid";
import NavBar from "./components/list/NavBar";

export default () => {
  const [chars, setChars] = createSignal<Char[]>([]);

  async function loadChars(id: string) {
    const chars = await list(id);
    setChars(chars.waifus);
  }

  const { id } = useParams();
  const [user] = createResource(id, loadChars);

  return (
    <Show when={!user.loading}>
      <NavBar setChars={setChars}></NavBar>
      <div id="content" class="max-h-full h-full min-h-screen bg-neutral-900">
        <section
          about="list"
          class="mx-auto py-20 flex flex-col justify-center items-center min-w-min w-full max-w-7xl"
        >
          <CharGrid characters={chars()} />
        </section>
      </div>
    </Show>
  );
};
