import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as Types from '../types/api.dto.ts';
import { login, logout } from "../store/reducers/userSlice.ts";

export const authAPI = createApi({
    reducerPath: 'authAPI',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api' }),
    tagTypes: ['auth'],
    endpoints: (build) => ({
        login: build.mutation<void, Types.UserRequest>({
            query: (credentials) => ({
                url: '/get_user',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['auth'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(login(data));
                } catch {
                    dispatch(logout());
                }
            }
        }),
        refreshToken: build.mutation<void, void>({
            query: () => ({
                url: '/refresh_token',
                method: 'POST',
            }),
        }),
        checkAuth: build.query<void, void>({
            query: () => ({
                url: '/check_auth',
                method: 'POST',
            }),
        }),
        logout: build.mutation<void, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['auth']
        }),
    }),
})
