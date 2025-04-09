import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a type for the benefit
export interface Benefit {
  id: string;
  code: string; // Using code for identification as per memory
  name: string;
  description?: string;
}

export const benefitApi = createApi({
  reducerPath: 'benefitApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getBenefits: builder.query<Benefit[], void>({
      query: () => '/benefits',
      // Transform the response if needed
      transformResponse: (response: any) => {
        // Ensure we return an array of benefits with the correct structure
        return Array.isArray(response)
          ? response.map((benefit: any) => ({
              id: benefit.id || benefit._id,
              code: benefit.code, // Using code for identification as per memory
              name: benefit.name,
              description: benefit.description,
            }))
          : [];
      },
    }),
    getBenefitById: builder.query<Benefit, string>({
      query: (id) => `/benefits/${id}`,
    }),
  }),
});

export const { useGetBenefitsQuery, useGetBenefitByIdQuery } = benefitApi;
