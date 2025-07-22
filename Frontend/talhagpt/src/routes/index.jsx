import React, { lazy } from "react";

const MainPage = lazy(() => import("../Pages/MainPage"));
const NotFound = lazy(() => import("../Pages/NotFound"));

const routes = [
  {
    path: "/main",
    element: <MainPage/>
  },
  {
    path: "*",
    element: <NotFound />
  }
];

export default routes;
