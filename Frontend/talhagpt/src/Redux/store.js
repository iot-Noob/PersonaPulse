import { configureStore } from "@reduxjs/toolkit";
import mouseEnterReducer from "./mouseSlice";
import dataSliceReducer from './dataSlice'
export const store = configureStore({
  reducer: {
    mouseenter: mouseEnterReducer,
    dataslice: dataSliceReducer
  },
});
