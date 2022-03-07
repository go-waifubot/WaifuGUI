export default async (userID: string) => {
  return await fetch(`https://waifuapi.karitham.dev/user/${userID}`)
    .then((res) => res.json())
    .then((res) => res as User);
};

export interface User {
  id: string;
  favorite?: Char;
  quote: string;
  waifus: Char[];
}
export interface Char {
  id: number;
  image: string;
  name: string;
  date: string;
  type: string;
}
