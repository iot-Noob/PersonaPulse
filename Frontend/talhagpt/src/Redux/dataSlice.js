import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const initialState = {
  data: [],
  settings: {},
  api_data: [],
  loading: false,
  custom_model_modam: false,
};

const dataSlicer = createSlice({
  name: "dataSlicers",
  initialState,
  reducers: {
    getAiModels: (state, action) => {
      state.data = action.payload;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    api_data: (state, action) => {
      state.api_data = action.payload;
    },
    loader: (state, action) => {
      state.loading = action.payload;
    },
    showCustModelModam: (state, action) => {
      state.custom_model_modam = action.payload;
    },
  },
});

export const {
  getAiModels,
  setSettings,
  api_data,
  loader,
  showCustModelModam,
} = dataSlicer.actions;
export default dataSlicer.reducer;
