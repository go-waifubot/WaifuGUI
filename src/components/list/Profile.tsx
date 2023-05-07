import { marked } from "marked";
import { Show } from "solid-js";
import { Char } from "../../api/list";
import CardRight from "./char/CardRIght";
import "./Profile.css";

export default (props: {
  favorite: Char | undefined;
  user: string | undefined;
  anilist_url: string | undefined;
  about: string | undefined;
}) => {
  const Favorite = !!props.favorite ? (
    <CardRight char={props.favorite} />
  ) : null;

  const username =
    props.anilist_url?.split(/https:\/\/anilist.co\/user\/([\w\d]+)/g)?.[1] ??
    props.user;

  const Username = !!props.anilist_url ? (
    <a
      class="text-text font-sans hover:underline-offset-2 w-min hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      href={props.anilist_url}
    >
      <h2 class="text-4xl">{username}</h2>
    </a>
  ) : null;

  return (
    <>
      <Show when={props.favorite && props.favorite.name !== ""}>
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <img
            src={props.favorite?.image}
            class="block w-auto h-auto object-cover max-w-64 rounded-3xl"
            alt={`image of the character ${props.favorite?.name}`}
          />
          <div id="char-description" class="px-8 flex flex-col gap-6">
            {Username}
            {Favorite}

            <Show when={props.about && props.about != ""}>
              <div>
                <div
                  id="about"
                  class="hyphens-auto overflow-hidden break-words whitespace-pre-wrap text-text font-sans"
                  innerHTML={marked.parse(
                    props.about?.replaceAll("\n", "\n\n") ?? ""
                  )}
                />
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </>
  );
};
