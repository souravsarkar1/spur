import type { Message } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Check, Copy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
    const isUser = message.sender === 'user';
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        toast.success('Message copied to clipboard');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div
            className={cn(
                'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
                isUser ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            <Avatar className={cn(
                'h-8 w-8 shrink-0',
                isUser ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-green-500 to-teal-600'
            )}>
                <AvatarFallback className="bg-transparent text-white">
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
            </Avatar>

            <div
                className={cn(
                    'rounded-2xl px-4 py-3 max-w-[80%] shadow-sm',
                    isUser
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                )}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                </p>
                <span
                    className={cn(
                        'text-xs mt-1 block opacity-70',
                        isUser ? 'text-blue-100' : 'text-gray-500'
                    )}
                >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>

                <div className="flex items-center justify-end">
                    {!isUser && !copied && <Copy onClick={handleCopy} className="h-4 w-4" />}
                    {copied && <Check className="h-4 w-4" />}
                </div>
            </div>
        </div>
    );
};
