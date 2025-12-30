import { Loader2 } from 'lucide-react';

export const TypingIndicator = () => {
    return (
        <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
};
