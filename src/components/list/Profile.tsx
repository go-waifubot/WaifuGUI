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
    <>
      <Show when={props.favorite && props.favorite.name !== ""}>
        <div class="flex">
          <img
            src={props.favorite?.image}
            class="object-cover max-h-fit rounded-sm"
            alt={`image of the character ${props.favorite?.name}`}
          />
          <div id="char-description" class="px-8 flex flex-col gap-4">
            <a
              class="text-xl capitalize w-max text-neutral-50"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://anilist.co/character/${props.favorite?.id}`}
            >
              {props.favorite?.name}
            </a>
            <button
              class="text-neutral-300 text-sm inline-flex gap-2 hover:text-neutral-50"
              onclick={() => {
                if (props.favorite?.id)
                  navigator.clipboard.writeText(props.favorite?.id.toString());
              }}
            >
              <Fa icon={faCopy} translateY="0.2px" />
              {props.favorite?.id}
            </button>
            <p class="text-neutral-300 text-sm inline-flex gap-2">
              <Fa icon={faCalendar} translateY="0.2px" />
              {new Date(props.favorite?.date ?? "").toLocaleDateString()}
            </p>
            <p class="text-neutral-300 text-sm inline-flex gap-2">
              <Fa icon={faBookAtlas} translateY="0.2px" />
              {props.favorite?.type === "OLD"
                ? "unknown"
                : props.favorite?.type.toLowerCase()}
            </p>
            <Show when={props.about && props.about != ""}>
              <AboutLinks />
              <p
                id="about"
                class="break-all"
                innerHTML={marked.parse(
                  props.about?.replaceAll("\n", "\n\n") ?? ""
                )}
              />
            </Show>
          </div>
        </div>
      </Show>
    </>
  );
};

const AboutLinks = createGlobalStyles`
    #about a {
      color: rgb(251 146 60);
    }
    #about a:hover {
      color: rgb(251 146 60);
    }
`;
