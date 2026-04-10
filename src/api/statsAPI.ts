import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as Types from '../types/api.dto.ts';

export const statsAPI = createApi({
    reducerPath: 'statsAPI',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api' }),
    tagTypes: ['stats'],
    endpoints: (build) => ({
        getGeneralStats: build.query<Types.StatisticsResponse, void>({
            query: () => '/get_gen_stats',
            providesTags: ['stats']
        }),
        getPersonalStats: build.query<any, void>({
            query: () => '/get_pers_stats',
            providesTags: ['stats']
        }),
    }),
})