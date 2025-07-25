import { configureStore } from "@reduxjs/toolkit";
import mouseEnterReducer from "./mouseSlice";

export const store = configureStore({
  reducer: {
    mouseenter: mouseEnterReducer,
  },
});
