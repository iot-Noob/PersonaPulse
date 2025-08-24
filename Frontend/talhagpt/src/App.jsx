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
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  pauseOnFocusLoss
  className="!m-0" // remove all margins
  toastClassName="rounded-lg shadow-lg bg-base-100 text-base-content !z-[99999] !p-4" // high z-index and padding
  style={{ top: 0, right: 0, zIndex: 99999 }} // override inline style if needed
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
