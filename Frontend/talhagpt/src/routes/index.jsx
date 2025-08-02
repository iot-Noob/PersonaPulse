import React, { lazy } from "react";

const MainPage = lazy(() => import("../Pages/MainPage"));
const NotFound = lazy(() => import("../Pages/NotFound"));
const CustomModelPage=lazy(() => import("../Pages/CustomModelPage"));
const routes = [
  {
    path: "/main",
    element: <MainPage/>
  },
    {
    path: "/custom", 
    element: <CustomModelPage/>
  },
  {
    path: "*",
    element: <NotFound />
  }
];

export default routes;
