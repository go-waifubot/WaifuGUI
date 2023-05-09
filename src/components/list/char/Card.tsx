import { Char } from "../../../api/list";
import CardRight from "./CardRIght";

export default (props: {
  char: Char;
  multiOwned?: boolean;
  missing?: boolean;
}) => {
  return (
    <div
      class={`bg-surfaceA rounded-lg relative flex h-44 w-full overflow-clip`}
      title="you do not own this character"
    >
      <img
        src={props.char.image}
        class="object-cover w-32"
        style={{
          filter: props.missing ? "grayscale(100%)" : "none",
        }}
        alt={`image of the character ${props.char.name}`}
      />
      {/* if char is multi-owned, add icon on top of image */}
      {props.multiOwned && (
        <span
          class="i-ph-apple-podcasts-logo text-emerald w-6 h-6 absolute bottom-2 right-2"
          title="This character is owned by someone else too!"
          style={{
            filter: "none",
          }}
        ></span>
      )}
      <CardRight char={props.char} class="p-4" />
    </div>
  );
};
