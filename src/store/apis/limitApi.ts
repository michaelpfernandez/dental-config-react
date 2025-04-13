import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LimitStructure } from '../../types/limitStructure';
import { clientLogger } from '../../utils/clientLogger';

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
    createLimitStructure: builder.mutation<LimitStructure, { limitConfig: Partial<LimitStructure> }>({
      query: (limitData) => {
        clientLogger.info('Starting createLimitStructure mutation:', { data: limitData });
        return {
          url: '/limit-structures',
          method: 'POST',
          body: limitData,
        };
      },
      transformResponse: (response: any) => {
        clientLogger.info('createLimitStructure response received:', { response });
        return response as LimitStructure;
      },
      transformErrorResponse: (error: any) => {
        clientLogger.error('createLimitStructure error:', { error });
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
