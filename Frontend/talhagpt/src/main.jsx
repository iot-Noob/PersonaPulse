import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store.js";
import { ToastContainer,toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
 
createRoot(document.getElementById("root")).render(
<>
<ToastContainer
  position="top-right"
  autoClose={7000}
  style={{ zIndex: 999999 }}
/>
  <Provider store={store}>
    <StrictMode>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </StrictMode>
  </Provider>
</>
);
