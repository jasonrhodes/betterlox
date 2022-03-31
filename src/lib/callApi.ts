import axios, { AxiosRequestConfig } from "axios";

const client = axios.create();

interface ApiLoginRequest {
  password: string;
  email: string;
}

interface User {
  id: number;
  letterboxd: string;
}

interface ApiLoginResponse {
  user: User;
}

interface ApiCheckIfExistsResponse {
  found: boolean;
  user?: Record<string, any>;
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

const api = { call: callApi, login, checkIfEmailExists, register, updateUser };
export default api;

async function login(email: string, password: string) {
  return callApi<ApiLoginResponse, ApiLoginRequest>({ url: "/api/login", method: "POST", data: { email, password }});
}

async function checkIfUsernameExists(username: string) {

}

async function checkIfEmailExists(email: string) {
  return callApi<ApiCheckIfExistsResponse>({ url: "/api/users/find", params: { email }})
}

async function register(email: string, password: string, username?: string) {
  return callApi<ApiRegisterResponse>({ url: "/api/users", method: "POST", data: { email, password, username }});
}

async function updateUser({ id, ...user }: { id: number } & Partial<UserType>) {
  return await callApi({ url: `/api/users/${id}`, method: "PUT", data: user });
}

async function callApi<T = unknown, D = unknown>(options: AxiosRequestConfig<D> = {}) {
  return await client.request<T>(options);
}