import {
  faBookAtlas,
  faCalendar,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { marked } from "marked";
import Fa from "solid-fa";
import { Show } from "solid-js";
import { createGlobalStyles } from "solid-styled-components";
import { Char } from "../../api/list";

export default (props: {
  favorite: Char | undefined;
  user: string | undefined;
  about: string | undefined;
}) => {
  return (
    <div class="flex flex-col px-3 py-8 gap-8">
      <Show when={props.favorite && props.favorite.name !== ""}>
        <div class="flex flex-row">
          <img
            src={props.favorite?.image}
            class="object-cover w-36 rounded-sm"
            alt={`image of the character ${props.favorite?.name}`}
          />
          <div id="char-description" class="p-3 w-fit flex-row gap-3">
            <a
              class="text-xl capitalize w-max text-neutral-100"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://anilist.co/character/${props.favorite?.id}`}
            >
              {props.favorite?.name}
            </a>
            <br />
            <button
              class="text-neutral-400 pt-1 text-sm inline-flex gap-2 hover:text-neutral-50"
              onclick={() =>
                navigator.clipboard.writeText(
                  props.favorite?.id.toString() ?? ""
                )
              }
            >
              <Fa icon={faCopy} translateY="0.2px" />
              {props.favorite?.id}
            </button>
            <br />
            <p class="text-neutral-200 pt-1 text-sm inline-flex gap-2">
              <Fa icon={faCalendar} translateY="0.2px" />
              {new Date(props.favorite?.date ?? "").toLocaleDateString()}
            </p>
            <br />
            <p class="text-neutral-300 pt-1 text-sm inline-flex gap-2">
              <Fa icon={faBookAtlas} translateY="0.2px" />
              {props.favorite?.type === "OLD"
                ? "unknown"
                : props.favorite?.type.toLowerCase()}
            </p>
          </div>
        </div>
      </Show>
      <Show when={props.about && props.about != ""}>
        <AboutLinks />
        <p
          id="about"
          class="text-neutral-100 text-sm border-l-2 p-2 border-x-pink-400 h-max break-all"
          innerHTML={marked.parse(props.about?.replaceAll("\n", "\n\n") ?? "")}
        />
      </Show>
    </div>
  );
};

const AboutLinks = createGlobalStyles`
    #about a {
      color: rgb(244 114 182);
    }
    #about a:hover {
      color: rgb(236 72 153);
    }
`;
