import { createSignal } from "solid-js";
import { Input } from "../../generic/Input";
import getList, { User } from "../../../api/list";
import Label from "../../generic/Label";

const [userAgainst, userAgaisntSet] = createSignal<User>();
export const UserAgainst = userAgainst;

const getUserAgainst = async (username: string) => {
  const { data: list, error } = await getList(username);
  if (error) {
    alert(error);
    return;
  }

  userAgaisntSet(list);
};

export default ({ class: classList }: { class?: string }) => {
  return (
    <Label text="Compare against user">
      <Input
        placeholder="641977906230198282"
        class={classList}
        onEnter={getUserAgainst}
        icon={
          <span
            class="i-ph-apple-podcasts-logo"
            title={
              !!userAgainst()
                ? "Comparing against user"
                : "Look for a user to compare against"
            }
            classList={{
              "text-emerald": !!userAgainst(),
            }}
          ></span>
        }
      ></Input>
    </Label>
  );
};
