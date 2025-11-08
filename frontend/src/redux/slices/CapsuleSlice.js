import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  details: {
    title: "",
    message: "",
    receiver: "",
  },
  mediaFiles: [],
};

const capsuleSlice = createSlice({
  name: "capsule",
  initialState,
  reducers: {
    setDetails: (state, action) => {
      state.details = action.payload;
    },
    setMedia: (state, action) => {
      state.mediaFiles = action.payload;
    },
    resetCapsule: () => initialState,
  },
});

export const { setDetails, setMedia, resetCapsule } = capsuleSlice.actions;
export default capsuleSlice.reducer;
