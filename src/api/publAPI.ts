import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as Types from '../types/api.dto.ts';

export const publAPI = createApi({
    reducerPath: 'publAPI',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api' }),
    tagTypes: ['publ'],
    endpoints: (build) => ({
        getPublications: build.query<any, void>({
            query: () => '/get_publ',
        }),
        getNextPublication: build.query<any, void>({
            query: () => '/next_publ',
        }),
        getPublicationFromHash: build.mutation<any, Types.RecordHashRequest>({
            query: (payload) => ({
                url: '/publ_from_hash',
                method: 'POST',
                body: payload,
            }),
        }),
    }),
})