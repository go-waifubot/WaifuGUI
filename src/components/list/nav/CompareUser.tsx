import { createSignal } from "solid-js";
import { Input } from "../../generic/Input";
import getList, { User } from "../../../api/list";

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
    <Input
      placeholder="Compare against user"
      class={classList}
      onEnter={getUserAgainst}
      icon={<span class="i-ph-apple-podcasts-logo"></span>}
    ></Input>
  );
};
