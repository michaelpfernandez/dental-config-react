import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LimitStructure, LimitFormData } from '../../types/limitStructure';

export const limitApi = createApi({
  reducerPath: 'limitApi',
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
  tagTypes: ['LimitStructure'],
  endpoints: (builder) => ({
    getLimitStructures: builder.query<LimitStructure[], void>({
      query: () => '/limit-structures',
      providesTags: ['LimitStructure'],
    }),
    getLimitStructureById: builder.query<LimitStructure, string>({
      query: (id) => `/limit-structures/${id}`,
      providesTags: (result, error, id) => [{ type: 'LimitStructure', id }],
    }),
    createLimitStructure: builder.mutation<LimitStructure, Partial<LimitStructure>>({
      query: (limitData) => {
        console.log('createLimitStructure mutation starting with data:', limitData);
        return {
          url: '/limit-structures',
          method: 'POST',
          body: limitData,
        };
      },
      transformResponse: (response: any) => {
        console.log('createLimitStructure API response:', response);
        return response as LimitStructure;
      },
      transformErrorResponse: (error: any) => {
        console.error('createLimitStructure API error:', error);
        return error;
      },

      invalidatesTags: ['LimitStructure'],
    }),
    updateLimitStructure: builder.mutation<
      LimitStructure,
      { id: string; limitData: Partial<LimitStructure> }
    >({
      query: ({ id, limitData }) => ({
        url: `/limit-structures/${id}`,
        method: 'PUT',
        body: limitData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'LimitStructure', id }],
    }),
    deleteLimitStructure: builder.mutation<void, string>({
      query: (id) => ({
        url: `/limit-structures/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LimitStructure'],
    }),
  }),
});

export const {
  useGetLimitStructuresQuery,
  useGetLimitStructureByIdQuery,
  useCreateLimitStructureMutation,
  useUpdateLimitStructureMutation,
  useDeleteLimitStructureMutation,
} = limitApi;
