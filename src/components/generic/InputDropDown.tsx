import { JSX, createSignal } from "solid-js";

export type Option = { value: string; label: string; image?: string };

export default (props: {
  options?: () => Option[];
  onChange: (e: any) => void;
  onEnter?: (e: string) => void;
  onInput?: (e: string) => void;
  placeholder?: string;
  icon?: JSX.Element;
  value: () => string;
}) => {
  const [open, setOpen] = createSignal(false);

  const formatOptions = (o: Option[] | undefined) =>
    o &&
    o.map((option) => {
      return (
        <button
          class="bg-transparent flex flex-row items-center justify-between px-4 py-2 gap-4 text-left w-full z-12 hover:bg-overlayA border-none text-text focus:outline-none"
          onClick={() => {
            props.onChange(option.value);
            setOpen(false);
          }}
        >
          {option.label}
          {option.image ? (
            // make image always the same size
            <img
              src={option.image}
              class="
              h-16
              object-cover
              "
            ></img>
          ) : (
            <div></div>
          )}
        </button>
      );
    });

  const Closed = () => {
    return (
      <input
        type="text"
        onInput={(e) => props.onInput && props.onInput(e.currentTarget.value)}
        onKeyPress={(e) =>
          props.onEnter &&
          e.key === "Enter" &&
          props.onEnter(e.currentTarget.value)
        }
        onFocus={() => setOpen(true)}
        placeholder={props.placeholder}
        value={props.value()}
        class="
            w-full
            py-4
            px-2
            rounded-t-2
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
          "rounded-b-2": !open(),
          "border-b-0": open(),
        }}
      ></input>
    );
  };

  const Open = () => {
    return (
      <div
        class="flex box-content justify-items-stretch w-[calc(100%-4px)] items-start border-solid flex-col z-10 p-0 border-t-0 border-2 border-blue rounded-b-md bg-base absolute right-0"
        classList={{
          hidden: !open(),
        }}
      >
        {formatOptions(props.options?.() || [])}
      </div>
    );
  };

  return (
    <>
      {open() && (
        <div
          class="absolute top-0 left-0 w-full h-full"
          onClick={() => setOpen(false)}
        ></div>
      )}
      <div class={"box-border w-full relative"}>
        <button
          class={
            "w-full p-0 flex flex-row justify-between font-sans border-none hover:cursor-pointer bg-transparent text-text focus:outline-none"
          }
        >
          <Closed />
          {props.icon && (
            <span class="top-4 right-3.5 absolute">{props.icon}</span>
          )}
        </button>
        {open() && <Open />}
      </div>
    </>
  );
};
