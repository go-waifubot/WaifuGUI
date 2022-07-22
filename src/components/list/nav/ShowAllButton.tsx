import { createSignal, Show } from "solid-js";
import GhostButton from "../../generic/GhostButton";

const [showAllValue, update] = createSignal(true);
export const ShowAllValue = showAllValue;
export default () => (
  <GhostButton onClick={() => update((b) => !b)}>
    <Show when={showAllValue()} fallback="Show Less">
      Show All
    </Show>
  </GhostButton>
);
