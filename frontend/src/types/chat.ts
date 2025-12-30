export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

export interface ChatResponse {
    reply: string;
    sessionId: string;
}

export interface HistoryResponse {
    messages: Message[];
}

export interface Session {
    id: string;
    title: string | null;
    created_at: string;
}

export interface SessionsResponse {
    sessions: Session[];
}
