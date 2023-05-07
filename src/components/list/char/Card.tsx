import { Char } from "../../../api/list";
import CardRight from "./CardRIght";

export default (props: { char: Char; colored?: boolean }) => {
  return (
    <div class="bg-surfaceA rounded-lg flex h-44 w-full overflow-clip">
      <img
        src={props.char.image}
        class="object-cover w-32"
        alt={`image of the character ${props.char.name}`}
      />
      <CardRight char={props.char} class="p-4" />
    </div>
  );
};
