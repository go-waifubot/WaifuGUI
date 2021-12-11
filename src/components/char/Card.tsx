import { Char } from "../../api/liste";

export default (props: { char: Char; colored?: boolean }) => {
  return (
    <div
      class="shadow-md shadow-zinc-900 rounded-md flex flex-col text-center pb-4 w-full bg-neutral-800"
      style={{
        "box-shadow": props.colored ? `2px 1px rgb(134 239 172 / 0.5)` : "",
      }}
    >
      <div id="char-img" class="top-0 left-0">
        <img
          src={props.char.image}
          class="rounded-md pb-2"
          alt={`image of the character ${props.char.name}`}
        />
      </div>
      <div id="char-description" class="mx-2">
        <a
          class="text-xl font-semibold capitalize text-green-300"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://anilist.co/character/${props.char.id}`}
        >
          {props.char.name}
        </a>
        <p class="text-neutral-400 pt-1">{props.char.id}</p>
      </div>
    </div>
  );
};
