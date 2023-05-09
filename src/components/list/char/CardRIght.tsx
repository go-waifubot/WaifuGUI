import { Show } from "solid-js";
import { Char } from "../../../api/list";

export default function CardRight(props: { char: Char; class?: string }) {
  return (
    <div
      id="char-description"
      class="flex flex-col gap-1 text-sm text-subtextA m-0 font-sans"
      classList={{
        [props.class!]: !!props.class,
      }}
    >
      <a
        class="capitalize m-0 items-center text-text hover:underline-offset-2 hover:underline text-lg"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://anilist.co/character/${props.char.id}`}
      >
        {props.char.name}
      </a>
      <button
        class="text-subtextA items-center m-0 p-0 bg-transparent text-sm hover:bg-transparent border-none inline-flex gap-2 hover:underline"
        onClick={() => navigator.clipboard.writeText(props.char.id.toString())}
      >
        <span class="i-ph-copy" />
        {props.char.id}
      </button>
      <Show when={props.char.date}>
        <p class="m-0 inline-flex gap-2 items-center">
          <span class="i-ph-calendar-blank" />
          {new Date(props.char.date!).toLocaleDateString(["fr-FR"])}
        </p>
      </Show>
      <Show when={props.char.date}>
        <p class="m-0 inline-flex gap-2 items-center">
          <span class="i-ph-certificate" />
          {props.char.type === "OLD"
            ? "unknown"
            : props.char.type!.toLowerCase()}
        </p>
      </Show>
    </div>
  );
}
