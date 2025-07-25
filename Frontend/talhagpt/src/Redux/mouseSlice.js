import { createSlice } from "@reduxjs/toolkit";

const initialState = { value: false, loading: false };

const mouseSlice = createSlice({
  name: "mouseEnter",
  initialState,
  reducers: {
    enter: (state) => {
      state.value = true;
    },
    exit: (state) => {
      state.value = false;
    },
    startLoading: (state) => {
      state.loading = true;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
  },
});

export const { enter, exit, startLoading, stopLoading } = mouseSlice.actions;
export default mouseSlice.reducer;
