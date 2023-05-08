import { JSX } from "solid-js";

export const Input = ({
  class: classList,
  placeholder,
  onInput,
  onEnter,
  icon,
}: {
  class?: string;
  onInput?: (a: string) => void;
  onEnter?: (a: string) => void;
  placeholder?: string;
  icon?: JSX.Element;
}) => {
  return (
    <div
      rounded-md
      class="relative mr-6"
      classList={{
        [classList!]: !!classList,
      }}
    >
      <input
        type="text"
        onInput={(e) => onInput && onInput(e.currentTarget.value)}
        onKeyPress={(e) =>
          onEnter && e.key === "Enter" && onEnter(e.currentTarget.value)
        }
        placeholder={placeholder}
        class="
          py-4
          px-2
          rounded-md
          focus:outline-none
          bg-base
          placeholder:font-sans
          border-blue
          hover:cursor-text
          placeholder:text-overlayC
          text-text
          overflow-clip
          "
        classList={{
          [classList!]: !!classList,
        }}
      ></input>
      {icon ? <span class="top-3.5 right-0 absolute">{icon}</span> : null}
    </div>
  );
};
