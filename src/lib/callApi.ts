import axios, { AxiosRequestConfig } from "axios";
import { ApiErrorResponse, ApiSuccessResponse } from "../common/types/api";
import { LetterboxdAccountLevel } from "../common/types/base";
import { UserPublic } from "../common/types/db";
import { ApiGetLetterboxdDetailsResponse } from "../pages/api/letterboxd";
import { CheckTokenApiRequest, CheckTokenApiResponse } from "../pages/api/users/check-token";

const client = axios.create();

interface ApiLoginRequest {
  password: string;
  email: string;
  rememberMe: boolean;
}

interface User {
  id: number;
  letterboxd: string;
}

interface ApiLoginResponse {
  user: UserPublic;
}

interface ApiCheckIfExistsResponse {
  found: boolean;
  user?: Record<string, any>;
}

export interface ApiRegisterOptions {
  email: string;
  password: string;
  avatarUrl: string;
  username: string;
  name: string;
  letterboxdAccountLevel: LetterboxdAccountLevel;
}
interface ApiRegisterResponse {
  created: boolean;
  username: string;
}

interface UserType {
  id: number;
  email: string;
  username: string;
  password: string;
}

const api = {
  call: callApi,
  login,
  checkRememberMeToken,
  checkIfEmailExists,
  register,
  updateUser,
  getLetterboxdUserDetails,
  forgotPassword,
  resetPassword
};
export default api;

async function callApi<T = unknown, D = unknown>(options: AxiosRequestConfig<D> = {}) {
  return client.request<T>(options);
}
export interface LoginOptions {
  email: string;
  password: string;
  rememberMe?: boolean;
}

async function login({ email, password, rememberMe = false }: LoginOptions) {
  return callApi<ApiLoginResponse, ApiLoginRequest>({
    url: "/api/users/login",
    method: "POST", 
    data: { email, password, rememberMe }
  });
}

async function checkRememberMeToken(token: string) {
  return callApi<CheckTokenApiResponse, CheckTokenApiRequest>({
    url: "/api/users/check-token",
    method: "POST",
    data: { token }
  });
}

async function checkIfUsernameExists(username: string) {

}

async function checkIfEmailExists(email: string) {
  return callApi<ApiCheckIfExistsResponse>({ url: "/api/users/find", params: { email }})
}

async function register(data: ApiRegisterOptions) {
  return callApi<ApiRegisterResponse, ApiRegisterOptions>({
    url: "/api/users/register",
    method: "POST",
    data
  });
}

async function updateUser({ id, ...user }: { id: number } & Partial<UserType>) {
  return callApi({ url: `/api/users/${id}`, method: "PUT", data: user });
}

async function getLetterboxdUserDetails(username: string) {
  return callApi<ApiGetLetterboxdDetailsResponse>({ url: `/api/letterboxd?username=${username}` })
}

interface ForgotPasswordOptions {
  email: string;
}

async function forgotPassword(data: ForgotPasswordOptions) {
  return callApi<unknown, ForgotPasswordOptions>({ url: "/api/users/forgot-password", method: "POST", data })
}

interface ResetPasswordOptions {
  token: string;
  updatedPassword: string;
}

async function resetPassword(data: ResetPasswordOptions) {
  return callApi<ApiSuccessResponse | ApiErrorResponse, ResetPasswordOptions>({ url: "/api/users/reset-password", method: "POST", data });
}