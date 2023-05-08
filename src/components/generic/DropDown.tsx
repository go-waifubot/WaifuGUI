import { createSignal } from "solid-js";

const DropDown = ({
  options,
  onChange,
  value,
  class: className,
}: {
  options: { value: string; label: string }[];
  onChange: (e: any) => void;
  value: () => string;
  class?: string;
}) => {
  const [open, setOpen] = createSignal(false);

  const Closed = () => {
    return <div>{value()}</div>;
  };

  const Open = () => {
    return (
      <div
        class="flex w-[calc(100%-4px)] items-start border-solid flex-col z-10 p-0 border-t-0 border-2 border-blue rounded-b-md bg-base absolute right-0"
        classList={{
          hidden: !open(),
        }}
      >
        {options.map((option) => (
          <button
            class="bg-transparent text-left w-full z-10 hover:bg-overlayA border-none text-text p-4 focus:outline-none"
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {open() ? (
        <div
          class="absolute top-0 left-0 w-full h-full"
          onClick={() => setOpen(false)}
        ></div>
      ) : null}
      <div class={className + " relative"}>
        <button
          class={
            className +
            " p-4 flex flex-row justify-between rounded-t-md font-sans border-2 border-blue hover:cursor-pointer bg-base text-text focus:outline-none "
          }
          classList={{
            "rounded-b-md": !open(),
            "border-b-0": open(),
          }}
          onClick={() => setOpen((prev) => !prev)}
        >
          <Closed />
          {open() ? (
            <span class="i-ph-caret-up"></span>
          ) : (
            <span class="i-ph-caret-down"></span>
          )}
        </button>
        {open() ? <Open /> : null}
      </div>
    </>
  );
};

export default DropDown;
