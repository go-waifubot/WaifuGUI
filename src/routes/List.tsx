import { createSignal } from "solid-js";
import list, { Char } from "../api/list";
import CharGrid from "../components/list/CharGrid";
import NavBar from "../components/list/NavBar";

const user = await list({ user: "206794847581896705" });
const [chars, setChars] = createSignal<Char[]>([]);
setChars(user.waifus);

export default () => {
  return (
    <>
      <NavBar setChars={setChars}></NavBar>
      <div id="content" class="max-h-full h-full min-h-screen bg-neutral-900">
        <section
          about="list"
          class="mx-auto py-20 flex flex-col justify-center items-center min-w-min w-full max-w-7xl"
        >
          <CharGrid characters={chars()} />
        </section>
      </div>
    </>
  );
};
