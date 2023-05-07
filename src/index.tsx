import { render } from "solid-js/web";
import "./index.css";
import "uno.css";
import { Router, hashIntegration } from "@solidjs/router";
import App from "./App";

render(
  () => (
    <Router source={hashIntegration()}>
      <App />
    </Router>
  ),
  document.getElementById("app")!
);
