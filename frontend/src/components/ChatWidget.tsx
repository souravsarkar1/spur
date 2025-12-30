import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { TypingIndicator } from '@/components/TypingIndicator';
import type { Message, Session } from '@/types/chat';
import { chatApi } from '@/services/chatService';
import { Send, MessageSquare, AlertCircle, Plus, History, ChevronRight, Trash2, Menu, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatWidget = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const savedSessionId = localStorage.getItem('chatSessionId');
        if (savedSessionId) {
            setSessionId(savedSessionId);
            loadHistory(savedSessionId);
        }
        fetchSessions();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId && !(event.target as Element).closest('.menu-container')) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    const fetchSessions = async () => {
        try {
            const { sessions: fetchedSessions } = await chatApi.getSessions();
            setSessions(fetchedSessions);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        }
    };

    const loadHistory = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { messages: historyMessages } = await chatApi.getHistory(id);
            setMessages(historyMessages);
            setSessionId(id);
            localStorage.setItem('chatSessionId', id);
            setSidebarOpen(false);
        } catch (err) {
            console.error('Failed to load history:', err);
            setError('Failed to load chat history. Starting fresh.');
            startNewChat();
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setSessionId(undefined);
        localStorage.removeItem('chatSessionId');
        setError(null);
        setSidebarOpen(false);
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to delete ALL chat history? This cannot be undone.')) return;

        setIsLoading(true);
        try {
            await chatApi.deleteAllSessions();
            startNewChat();
            fetchSessions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (sessionIdToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this chat?')) return;

        setIsLoading(true);
        setOpenMenuId(null);

        try {

            if (sessionId === sessionIdToDelete) {
                startNewChat();
            }

            fetchSessions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete session');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        const trimmedMessage = inputValue.trim();

        if (!trimmedMessage || isLoading) return;

        if (trimmedMessage.length > 2000) {
            setError('Message is too long. Please keep it under 2000 characters.');
            return;
        }

        setError(null);
        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: trimmedMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const { reply, sessionId: newSessionId } = await chatApi.sendMessage(
                trimmedMessage,
                sessionId
            );

            if (!sessionId && newSessionId) {
                setSessionId(newSessionId);
                localStorage.setItem('chatSessionId', newSessionId);
                fetchSessions();
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: reply,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message');
            setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
            <div className="h-full max-w-[1920px] mx-auto flex">

                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside className={cn(
                    "fixed md:relative inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}>
                    <div className="flex-none p-4 border-b border-slate-800">
                        <Button
                            onClick={startNewChat}
                            className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-blue-900/50"
                        >
                            <Plus className="h-4 w-4" />
                            New Chat
                        </Button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <div className="flex-none p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="h-3 w-3" />
                                Recent Chats
                            </div>

                            {sessions.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                    title="Delete all history"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        <div className="px-2 pb-3">
                            <Input
                                placeholder="Search chats..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full h-10'
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-4 space-y-1">
                            {sessions.filter((session) => session?.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((session) => (
                                <div key={session.id} className='flex items-center gap-1 relative menu-container'>
                                    <button
                                        onClick={() => loadHistory(session.id)}
                                        className={cn(
                                            "flex-1 text-left p-3 rounded-lg transition-all flex items-center gap-3 group",
                                            sessionId === session.id
                                                ? "bg-slate-800 text-white shadow-lg"
                                                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                        )}
                                    >
                                        <MessageSquare className={cn(
                                            "h-4 w-4 shrink-0",
                                            sessionId === session.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"
                                        )} />
                                        <div className="flex-1 truncate min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {session.title || "Untitled Chat"}
                                            </p>
                                            <p className="text-[10px] opacity-50 truncate">
                                                {new Date(session.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                                            sessionId === session.id && "opacity-100"
                                        )} />
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === session.id ? null : session.id);
                                            }}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors hover:bg-slate-800",
                                                openMenuId === session.id && "bg-slate-800"
                                            )}
                                        >
                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                        </button>

                                        {openMenuId === session.id && (
                                            <div className="absolute right-0 top-full mt-1 z-[100] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 min-w-[160px]">
                                                <button
                                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {sessions.length === 0 && (
                                <div className="text-center py-12 px-4 text-slate-500 text-sm">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                    No chat history yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="flex-none p-4 border-t border-slate-800 bg-slate-900/80">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shrink-0">
                                S
                            </div>
                            <div className="flex-1 truncate min-w-0">
                                <p className="text-sm font-medium truncate">SpurStore Agent</p>
                                <p className="text-[10px] text-slate-500">Powered by AI • v1.0</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Fixed Header */}
                    <header className="flex-none bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden text-slate-600"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={startNewChat}
                            className="hidden md:flex text-slate-600 hover:text-slate-900"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New
                        </Button>
                    </header>

                    <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-slate-50 to-white">
                        <div className="w-full mx-auto px-4 py-6">
                            {messages.length === 0 && !isLoading && (
                                <div className="text-center py-12 md:py-16">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 shadow-sm mb-6">
                                        <MessageSquare className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                        Welcome to SpurStore Support
                                    </h3>
                                    <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed mb-8">
                                        Ask me anything about shipping, returns, support hours, or general product questions.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                        {[
                                            "What's your shipping policy?",
                                            "How do I return an item?",
                                            "What are your support hours?",
                                            "How can I contact support?"
                                        ].map((prompt) => (
                                            <button
                                                key={prompt}
                                                onClick={() => setInputValue(prompt)}
                                                className="p-4 text-left text-sm text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md hover:text-blue-600 transition-all"
                                            >
                                                <span className="font-medium">{prompt}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {messages.map((message) => (
                                    <ChatMessage key={message.id} message={message} />
                                ))}

                                {isLoading && <TypingIndicator />}
                            </div>

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="flex-none border-t border-slate-200 bg-white">
                        {error && (
                            <div className="px-4 pt-3">
                                <div className="max-w-4xl mx-auto p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        <div className="p-4">
                            <div className="w-full mx-auto">
                                <div className="relative flex items-end gap-2">
                                    <div className="flex-1 relative">
                                        <Input
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type your message..."
                                            disabled={isLoading}
                                            className="pr-4 py-5 rounded-xl border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent shadow-sm resize-none"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={isLoading || !inputValue.trim()}
                                        size="icon"
                                        className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 text-white shadow-lg transition-all active:scale-95 shrink-0"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 text-center">
                                    Press Enter to send • Shift + Enter for new line
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};