import { render } from "solid-js/web";
import "tailwindcss/tailwind.css";
import { App } from "./App";
import "./index.css";

render(() => <App />, document.getElementById("root") as HTMLElement);
