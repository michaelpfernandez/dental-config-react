import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BenefitClassStructure } from '../../types/benefitClassStructure';

interface BenefitClassState {
  selectedStructureId: string | null;
  selectedClassId: string | null;
  configurationDirty: boolean;
  localStructure: BenefitClassStructure | null;
}

const initialState: BenefitClassState = {
  selectedStructureId: null,
  selectedClassId: null,
  configurationDirty: false,
  localStructure: null,
};

const benefitClassSlice = createSlice({
  name: 'benefitClass',
  initialState,
  reducers: {
    setSelectedStructure: (state, action: PayloadAction<string | null>) => {
      state.selectedStructureId = action.payload;
      state.selectedClassId = null;
    },
    setSelectedClass: (state, action: PayloadAction<string | null>) => {
      state.selectedClassId = action.payload;
    },
    setLocalStructure: (state, action: PayloadAction<BenefitClassStructure | null>) => {
      state.localStructure = action.payload;
    },
    updateLocalStructure: (state, action: PayloadAction<Partial<BenefitClassStructure>>) => {
      if (state.localStructure) {
        state.localStructure = { ...state.localStructure, ...action.payload };
        state.configurationDirty = true;
      }
    },
    updateClass: (state, action: PayloadAction<{ classId: string; updates: any }>) => {
      if (state.localStructure) {
        const { classId, updates } = action.payload;
        const updatedClasses = state.localStructure.classes.map((cls) => {
          if (cls.id === classId) {
            return { ...cls, ...updates };
          }
          return cls;
        });

        state.localStructure = {
          ...state.localStructure,
          classes: updatedClasses,
        };
        state.configurationDirty = true;
      }
    },
    addBenefitToClass: (
      state,
      action: PayloadAction<{ classId: string; benefit: { code: string; name: string } }>
    ) => {
      if (state.localStructure) {
        const { classId, benefit } = action.payload;
        const updatedClasses = state.localStructure.classes.map((cls) => {
          if (cls.id === classId) {
            return {
              ...cls,
              benefits: [...cls.benefits, benefit],
            };
          }
          return cls;
        });

        state.localStructure = {
          ...state.localStructure,
          classes: updatedClasses,
        };
        state.configurationDirty = true;
      }
    },
    removeBenefitFromClass: (
      state,
      action: PayloadAction<{ classId: string; benefitCode: string }>
    ) => {
      if (state.localStructure) {
        const { classId, benefitCode } = action.payload;
        const updatedClasses = state.localStructure.classes.map((cls) => {
          if (cls.id === classId) {
            return {
              ...cls,
              benefits: cls.benefits.filter((b) => b.code !== benefitCode),
            };
          }
          return cls;
        });

        state.localStructure = {
          ...state.localStructure,
          classes: updatedClasses,
        };
        state.configurationDirty = true;
      }
    },
    markConfigurationDirty: (state) => {
      state.configurationDirty = true;
    },
    markConfigurationClean: (state) => {
      state.configurationDirty = false;
    },
  },
});

export const {
  setSelectedStructure,
  setSelectedClass,
  setLocalStructure,
  updateLocalStructure,
  updateClass,
  addBenefitToClass,
  removeBenefitFromClass,
  markConfigurationDirty,
  markConfigurationClean,
} = benefitClassSlice.actions;

export default benefitClassSlice.reducer;
