import { configureStore } from "@reduxjs/toolkit";
import capsuleReducer from "./slices/CapsuleSlice";

const store = configureStore({
  reducer: {
    capsule: capsuleReducer,
  },
});

export default store;
