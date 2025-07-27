import { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Start a conversation</h3>
            <p className="text-muted-foreground">
              Send a message to begin chatting with AI
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role !== 'user' && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          
          <Card
            className={`max-w-[70%] p-4 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
            <div className={`text-xs mt-2 opacity-70 ${
              message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}>
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </Card>
          
          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <Card className="bg-muted p-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </Card>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}