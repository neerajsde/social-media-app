import { baseApi } from '../../services/api';
import type { LoginRequest, LoginResponse, RegisterStep1Request, RegisterResponse, OtpVerifyRequest, User } from '../../types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    loginOtpVerify: builder.mutation<LoginResponse, OtpVerifyRequest>({
      query: (body) => ({
        url: '/auth/login/otp-verify',
        method: 'POST',
        body,
      }),
    }),
    resendLoginOtp: builder.mutation<{ success: boolean; message: string }, { token: string }>({
      query: ({ token }) => ({
        url: `/auth/login/otp/resend/${token}`,
        method: 'POST',
      }),
    }),
    registerStep1: builder.mutation<RegisterResponse, RegisterStep1Request>({
      query: (body) => ({
        url: '/auth/register/otp',
        method: 'POST',
        body,
      }),
    }),
    registerStep2: builder.mutation<RegisterResponse, OtpVerifyRequest>({
      query: (body) => ({
        url: '/auth/register/verify',
        method: 'POST',
        body,
      }),
    }),
    resendRegisterOtp: builder.mutation<{ success: boolean; message: string }, { token: string }>({
      query: ({ token }) => ({
        url: `/auth/register/otp/resend/${token}`,
        method: 'POST',
      }),
    }),
    resetPasswordRequest: builder.mutation<{ success: boolean; message: string; token: string }, { emailOrUsername: string }>({
      query: (body) => ({
        url: '/auth/reset-password/request',
        method: 'POST',
        body,
      }),
    }),
    resetPasswordVerify: builder.mutation<{ success: boolean; message: string; token: string }, OtpVerifyRequest>({
      query: (body) => ({
        url: '/auth/reset-password/verify',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ success: boolean; message: string }, { password: string; confirmPassword: string; token: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    refreshToken: builder.mutation<LoginResponse, { token: string }>({
      query: (body) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    logoutAllDevices: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout/all-devices',
        method: 'POST',
      }),
    }),
    getSessions: builder.query<{ success: boolean; sessions: any[] }, void>({
      query: () => '/auth/sessions',
    }),
    deleteAccount: builder.mutation<void, { password: string; reason: string }>({
      query: (body) => ({
        url: '/auth/user/delete/account',
        method: 'DELETE',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginOtpVerifyMutation,
  useResendLoginOtpMutation,
  useRegisterStep1Mutation,
  useRegisterStep2Mutation,
  useResendRegisterOtpMutation,
  useResetPasswordRequestMutation,
  useResetPasswordVerifyMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useLogoutAllDevicesMutation,
  useGetSessionsQuery,
  useDeleteAccountMutation,
} = authApi;
