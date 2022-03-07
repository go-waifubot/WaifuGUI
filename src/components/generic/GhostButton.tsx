import { JSX } from "solid-js/jsx-runtime";

export default (props: {
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  type?: "button" | "submit" | "reset";
  children?: any;
}) => {
  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      class="rounded-md border-2 border-pink-500 text-neutral-100 px-2 py-1"
    >
      {props.children ?? {}}
    </button>
  );
};
