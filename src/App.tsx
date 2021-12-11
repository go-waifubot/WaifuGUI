import { Component } from "solid-js";
import liste, { Char } from "./api/liste";
import CharGrid from "./components/CharGrid";
import NavBar from "./components/NavBar";

let v = [
  {
    name: "Korone Inugami",
    imageURL:
      "https://s4.anilist.co/file/anilistcdn/character/large/b169493-ylOPdCan3V2s.png",
    id: 169493,
  },
];
v = v.concat(v);
v = v.concat(v);
v = v.concat(v);
v = v.concat(v);
v = v.concat(v);
v = v.concat(v);
v = v.concat(v);
v = v.concat(v);
v = v.concat(v);
v = v.concat(v); // 1024
v = v.concat(v); // 2048
v = v.concat(v); // 4096
v = v.concat(v); // 8192
v = v.concat(v); // 16384
v = v.concat(v); // 32768

const user = await liste();
const chars: Char[] = user.waifus;

export const App: Component = () => {
  return (
    <>
      <NavBar></NavBar>
      <div id="content" class="max-h-full h-full min-h-screen bg-neutral-900">
        <section
          about="list"
          class="mx-auto py-20 flex flex-col justify-center items-center min-w-min w-full max-w-7xl"
        >
          <CharGrid characters={chars} />
        </section>
      </div>
    </>
  );
};
