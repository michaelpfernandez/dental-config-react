import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BenefitClassStructure } from '../../types/benefitClassStructure';

export const benefitClassApi = createApi({
  reducerPath: 'benefitClassApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('dental_user');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['BenefitClassStructure', 'BenefitClass'],
  endpoints: (builder) => ({
    getBenefitClassStructures: builder.query<BenefitClassStructure[], void>({
      query: () => '/benefit-class-structures',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'BenefitClassStructure' as const, id: _id })),
              { type: 'BenefitClassStructure', id: 'LIST' },
            ]
          : [{ type: 'BenefitClassStructure', id: 'LIST' }],
    }),

    getBenefitClassStructureById: builder.query<BenefitClassStructure, string>({
      query: (id) => `/benefit-class-structures/${id}`,
      providesTags: (result, error, id) => [{ type: 'BenefitClassStructure', id }],
    }),

    createBenefitClassStructure: builder.mutation<
      BenefitClassStructure,
      Partial<BenefitClassStructure>
    >({
      query: (data) => ({
        url: '/benefit-class-structures',
        method: 'POST',
        body: { classConfig: data },
      }),
      invalidatesTags: [{ type: 'BenefitClassStructure', id: 'LIST' }],
    }),

    updateBenefitClassStructure: builder.mutation<
      BenefitClassStructure,
      { id: string; data: Partial<BenefitClassStructure> }
    >({
      query: ({ id, data }) => ({
        url: `/benefit-class-structures/${id}`,
        method: 'PUT',
        body: { classConfig: data },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BenefitClassStructure', id },
        { type: 'BenefitClassStructure', id: 'LIST' },
      ],
    }),

    deleteBenefitClassStructure: builder.mutation<void, string>({
      query: (id) => ({
        url: `/benefit-class-structures/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'BenefitClassStructure', id: 'LIST' }],
    }),

    getBenefitClasses: builder.query<BenefitClassStructure[], void>({
      query: () => '/config/benefit-classes',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'BenefitClassStructure' as const, id: _id })),
              { type: 'BenefitClassStructure', id: 'LIST' },
            ]
          : [{ type: 'BenefitClassStructure', id: 'LIST' }],
    }),

    getAvailableBenefits: builder.query<any, void>({
      query: () => '/api/config/benefits',
    }),
  }),
});

export const {
  useGetBenefitClassStructuresQuery,
  useGetBenefitClassStructureByIdQuery,
  useCreateBenefitClassStructureMutation,
  useUpdateBenefitClassStructureMutation,
  useDeleteBenefitClassStructureMutation,
  useGetBenefitClassesQuery,
  useGetAvailableBenefitsQuery,
} = benefitClassApi;
