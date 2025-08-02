import React, { lazy } from "react";
import SuspenseSlice from "../components/SuspenseSlice";
const MainRoutes = lazy(() => import("./MianRoutes"));
import LoadingModel from "../components/LoadingModel";
import {useSelector } from "react-redux";
const RouteSlicer = () => {
  let ple=useSelector ((state)=>state.dataslice.loading)
  return (
    <>
      <div className="overflow-x-hidden">
        <SuspenseSlice >
          <LoadingModel enable={ple} >
   <MainRoutes />
          </LoadingModel>
        </SuspenseSlice>
      </div>
    </>
  );
};

export default RouteSlicer;
