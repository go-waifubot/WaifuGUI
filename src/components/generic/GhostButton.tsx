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
      class="rounded-md border-2 border-neutral-800 text-neutral-800 px-2 py-1 min-w-max"
    >
      {props.children ?? {}}
    </button>
  );
};
