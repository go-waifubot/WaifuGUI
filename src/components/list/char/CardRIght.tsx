import {
  faBookAtlas,
  faCalendar,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import Fa from "solid-fa";
import { Char } from "../../../api/list";

export default function CardRight(props: { char: Char; class?: string }) {
  return (
    <div
      id="char-description"
      classList={{
        [props.class!]: !!props.class,
      }}
    >
      <a
        class="text-md capitalize text-neutral-100 hover:underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://anilist.co/character/${props.char.id}`}
      >
        {props.char.name}
      </a>
      <br />
      <button
        class="text-neutral-200 pt-1 text-xs inline-flex gap-2 hover:text-neutral-50"
        onclick={() => navigator.clipboard.writeText(props.char.id.toString())}
      >
        <Fa icon={faCopy} translateY="0.2px" />
        {props.char.id}
      </button>
      <br />
      <p class="text-neutral-200 pt-1 text-xs inline-flex gap-2">
        <Fa icon={faCalendar} translateY="0.2px" />
        {new Date(props.char.date).toLocaleDateString(["fr-FR"])}
      </p>
      <br />
      <p class="text-neutral-200 pt-1 text-xs inline-flex gap-2">
        <Fa icon={faBookAtlas} translateY="0.2px" />
        {props.char.type === "OLD" ? "unknown" : props.char.type.toLowerCase()}
      </p>
    </div>
  );
}
