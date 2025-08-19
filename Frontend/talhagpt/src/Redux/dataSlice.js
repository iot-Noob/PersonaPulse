import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const initialState = { data:[],settings:{},api_data:[],loading:false};

const dataSlicer = createSlice({
  name: "dataSlicers",
  initialState,
  reducers: {
    getAiModels: (state,action) => {
      state.data = action.payload;
    },
    setSettings:(state,action)=>{
      state.settings=action.payload;
    },
    api_data:(state,action)=>{
      state.api_data=action.payload;
    },
    loader:(state,action)=>{
      state.loading=action.payload
    }
  },
});

export const {getAiModels,setSettings,api_data,loader} = dataSlicer.actions;
export default dataSlicer.reducer;
