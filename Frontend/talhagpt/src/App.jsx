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
      <ToastContainer
  position="top-right"
  autoClose={5000}
  className="mt-0 mr-0"  // remove margin-top and margin-right
  toastClassName="rounded-lg shadow-lg bg-base-100 text-base-content" // daisyUI theme colors & rounded corners
  style={{ top: 0, right: 0, margin: 0, padding: 0, zIndex: 9999 }}
/>
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
