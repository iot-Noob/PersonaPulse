import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import routes from "./index";
import SuspenseSlice from "../components/SuspenseSlice";
import Navbar from "../components/Navbar";
const MainRoutes = () => {
  return (
    <>
      <SuspenseSlice>
        <Routes>
          {routes.map((route, i) => (
            <Route key={i} path={route.path} element={route.element} />
          ))}
        </Routes>
      </SuspenseSlice>
    </>
  );
};

export default MainRoutes;
