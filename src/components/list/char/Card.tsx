import { Char } from "../../../api/list";
import CardRight from "./CardRIght";

export default (props: { char: Char; colored?: boolean }) => {
  return (
    <div
      class="rounded-sm bg-neutral-800 flex h-44 w-full"
      style={{
        "box-shadow": `2px 2px rgb(${
          props.colored ? "134 239 172" : "0 0 0"
        } / 0.5)`,
      }}
    >
      <img
        src={props.char.image}
        class="object-cover overflow-clip w-32 rounded-sm"
        alt={`image of the character ${props.char.name}`}
      />
      <CardRight char={props.char} class="p-4" />
    </div>
  );
};
