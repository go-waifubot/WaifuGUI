import { hashIntegration, Route, Router, Routes } from "solid-app-router";
import { lazy } from "solid-js";
const List = lazy(() => import("./List"));
const Home = lazy(() => import("./Home"));

export default () => {
  return (
    <Router source={/* @once */ hashIntegration()}>
      <Routes>
        <Route path="/list/:id" element={<List />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};
