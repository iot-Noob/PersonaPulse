import React, {    lazy } from "react";
import { Routes, Route,Navigate } from "react-router-dom";
const RouteSlicer=lazy(()=>import("./routes/RouteSlicer"))
const NotFound=lazy(()=>import("./Pages/NotFound"))
import SuspenseSlice from "./components/SuspenseSlice";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
function App() {
  return (
<>
      <ToastContainer position="top-right" autoClose={7000} />
    <SuspenseSlice>
      <Routes>
         
        <Route path="*" element={<NotFound />} />
        <Route path="/persona/*" element={<RouteSlicer />} />
        <Route path="/" element={<Navigate to={"/persona/main"} />} />
      </Routes>
    </SuspenseSlice>
</>
  );
}

export default App;
