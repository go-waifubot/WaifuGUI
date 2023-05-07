import { Route, Routes } from "@solidjs/router";
import { lazy } from "solid-js";

const Home = lazy(() => import("./Home"));
const List = lazy(() => import("./List"));
const Page404 = lazy(() => import("./404"));

export default () => {
  return (
    <Routes>
      <Route path="/list/:id" element={<List />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};
