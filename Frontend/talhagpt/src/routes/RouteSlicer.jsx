import React, { lazy } from "react";
import SuspenseSlice from "../components/SuspenseSlice";
const MainRoutes = lazy(() => import("./MianRoutes"));
const RouteSlicer = () => {
  return (
    <>
      <div className="">
        <SuspenseSlice>
          <MainRoutes />
        </SuspenseSlice>
      </div>
    </>
  );
};

export default RouteSlicer;
