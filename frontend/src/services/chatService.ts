import axios from 'axios';
import type { ChatResponse, HistoryResponse, SessionsResponse } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const chatApi = {
    sendMessage: async (message: string, sessionId?: string): Promise<ChatResponse> => {
        try {
            const response = await axios.post<ChatResponse>(`${API_BASE_URL}/chat/message`, {
                message,
                sessionId,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error || 'Failed to send message');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },

    getHistory: async (sessionId: string): Promise<HistoryResponse> => {
        try {
            const response = await axios.get<HistoryResponse>(
                `${API_BASE_URL}/chat/history/${sessionId}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error || 'Failed to fetch history');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },

    getSessions: async (): Promise<SessionsResponse> => {
        try {
            const response = await axios.get<SessionsResponse>(
                `${API_BASE_URL}/chat/sessions`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error || 'Failed to fetch sessions');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },

    deleteAllSessions: async (): Promise<{ message: string }> => {
        try {
            const response = await axios.delete<{ message: string }>(
                `${API_BASE_URL}/chat/sessions`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error || 'Failed to delete history');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },
};
