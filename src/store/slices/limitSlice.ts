import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LimitStructure, LimitsState } from '../../types/limitStructure';

const initialState: LimitsState = {
  items: [],
  loading: false,
  error: null,
  selectedLimit: null,
};

export const limitSlice = createSlice({
  name: 'limits',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLimitStructures: (state, action: PayloadAction<LimitStructure[]>) => {
      state.items = action.payload;
    },
    addLimitStructure: (state, action: PayloadAction<LimitStructure>) => {
      state.items.push(action.payload);
    },
    updateLimitStructure: (state, action: PayloadAction<LimitStructure>) => {
      const index = state.items.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteLimitStructure: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    setSelectedLimit: (state, action: PayloadAction<LimitStructure | null>) => {
      state.selectedLimit = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setLimitStructures,
  addLimitStructure,
  updateLimitStructure,
  deleteLimitStructure,
  setSelectedLimit,
} = limitSlice.actions;

export default limitSlice.reducer;
