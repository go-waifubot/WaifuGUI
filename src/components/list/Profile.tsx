import { marked } from "marked";
import { Show } from "solid-js";
import { createGlobalStyles } from "solid-styled-components";
import { Char } from "../../api/list";
import CardRight from "./char/CardRIght";

export default (props: {
  favorite: Char | undefined;
  user: string | undefined;
  anilist_url: string | undefined;
  about: string | undefined;
}) => {
  const Favorite = !!props.favorite ? (
    <CardRight char={props.favorite} />
  ) : (
    <></>
  );

  const username =
    props.anilist_url?.split(/https:\/\/anilist.co\/user\/([\w\d]+)/g)?.[1] ??
    props.user;

  const Username = !!props.anilist_url ? (
    <a
      class="text-neutral-100 hover:underline-offset-2 w-min hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      href={props.anilist_url}
    >
      <h2 class="text-4xl">{username}</h2>
    </a>
  ) : (
    <></>
  );

  return (
    <>
      <Show when={props.favorite && props.favorite.name !== ""}>
        <div class="flex">
          <img
            src={props.favorite?.image}
            class="object-cover max-h-fit rounded-sm"
            alt={`image of the character ${props.favorite?.name}`}
          />
          <div id="char-description" class="px-8 flex flex-col gap-6">
            {Username}
            {Favorite}

            <Show when={props.about && props.about != ""}>
              <AboutLinks />
              <p
                id="about"
                class=""
                style={{
                  hyphens: "auto",
                  overflow: "hidden",
                  "word-break": "break-word",
                }}
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
