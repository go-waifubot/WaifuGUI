import { JSX } from "solid-js/jsx-runtime";

export default (props: {
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  children: any;
}) => {
  return (
    <button
      onClick={props.onClick}
      class="rounded-md border-2 border-neutral-800 text-neutral-800 px-2 py-1 w-28"
    >
      {props.children}
    </button>
  );
};
