export default async () => {
  return await fetch("https://waifuapi.kar.moe/user/206794847581896705")
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
  date: Date;
  type: string;
}
