// lib/api.js — Axios client for backend
import axios from 'axios';
import { useAuthStore } from './auth-store';

const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
export const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function analyzeProfile(profile) {
  const { data } = await api.post('analyze', profile);
  return data;
}

export async function sendChatMessage(message, profile, conversation_id = null) {
  const { data } = await api.post('chat', { message, profile, conversation_id });
  return data; // Returns { response, conversation_id, title }
}

export async function fetchChatHistory() {
  const { data } = await api.get('chat/history');
  return data;
}

export async function fetchThreadMessages(id) {
  const { data } = await api.get(`chat/history/${id}`);
  return data;
}

export async function deleteChatThread(id) {
  const { data } = await api.delete(`chat/history/${id}`);
  return data;
}

export async function getProfile() {
  const { data } = await api.get('analyze/me');
  return data;
}

export async function fetchRawProfile() {
  const { data } = await api.get('analyze/profile/me');
  return data;
}

export async function deleteProfileData() {
  await api.delete('analyze/me');
}

export async function exportProfileData() {
  const { data } = await api.get('analyze/export');
  return data;
}

export async function uploadFinancialDoc(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export default api;
