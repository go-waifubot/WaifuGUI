import { JSX } from "solid-js/jsx-runtime";

export default (props: {
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  type?: "button" | "submit" | "reset";
  children?: any;
  class?: string;
}) => {
  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      class="rounded-md border-2 border-orange-400 hover:border-orange-50 text-neutral-100 h-12 px-4 py-2"
      classList={{
        [props.class!]: !!props.class,
      }}
    >
      {props.children ?? {}}
    </button>
  );
};
