import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as Types from '../types/api.dto.ts';

export const recordAPI = createApi({
    reducerPath: 'recordAPI',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api' }),
    tagTypes: ['record'],
    endpoints: (build) => ({
        getRecordsData: build.query<any, void>({
            query: () => ({
                url: '/get_records_data',
                method: 'POST',
            }),
            providesTags: ['record']
        }),
        getRecordByHash: build.mutation<Types.GetRecordResponse, Types.RecordHashRequest>({
            query: (payload) => ({
                url: '/get_record',
                method: 'POST',
                body: payload,
            }),
        }),
        insertRecord: build.mutation<void, Types.InsertRecordsRequest>({
            query: (record) => ({
                url: '/insert_record',
                method: 'POST',
                body: record,
            }),
            invalidatesTags: ['record']
        }),
        editRecord: build.mutation<void, Types.EditRecordRequest>({
            query: (record) => ({
                url: '/edit_record',
                method: 'POST',
                body: record,
            }),
            invalidatesTags: ['record']
        }),
        deleteRecord: build.mutation<void, Types.RecordHashRequest>({
            query: (payload) => ({
                url: '/del_record',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['record']
        }),
    }),
})