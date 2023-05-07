const ROOT_URL = "https://waifuapi.karitham.dev";

export interface User {
  id: string;
  favorite?: Char;
  quote?: string;
  anilist_url?: string;
  waifus: Char[];
}
export interface Char {
  id: number;
  image: string;
  name: string;
  date: string;
  type: string;
}

export type AsyncTuple<
  ErrorType extends any = Error,
  DataType extends any = unknown
> =
  | {
      error: ErrorType;
      data: null;
    }
  | { error: null; data: DataType };

/**
 * Gracefully handles a given Promise factory.
 * @example
 * const { error, data } = await until(() => asyncAction())
 */
export const until = async <
  ErrorType extends any = Error,
  DataType extends any = unknown
>(
  promise: () => Promise<DataType>
): Promise<AsyncTuple<ErrorType, DataType>> => {
  try {
    const data = await promise().catch((error) => {
      throw error;
    });
    return { error: null, data };
  } catch (error) {
    return { error: error as any, data: null };
  }
};

export const getUser = async (anilistUsername: string) => {
  return until(() =>
    fetch(
      `${ROOT_URL}/user/find?anilist=${encodeURIComponent(anilistUsername)}`,
      {
        cache: "force-cache",
      }
    )
      .then((res) => res.json())
      .then(
        (res) =>
          res as {
            id: string;
          }
      )
  );
};

export const getList = async (userID: string) => {
  return until(() =>
    fetch(`https://waifuapi.karitham.dev/user/${userID}`, {
      cache: "force-cache",
    })
      .then((res) => res.json())
      .then((res) => res as User)
  );
};

export default getList;
