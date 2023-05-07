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
      class="rounded-md font-sans border-blue hover:cursor-pointer bg-base text-text p-4 focus:outline-none"
      classList={{
        [props.class!]: !!props.class,
      }}
    >
      {props.children}
    </button>
  );
};
