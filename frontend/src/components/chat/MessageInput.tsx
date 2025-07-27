import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetProvidersQuery } from '@/store/api/providersApi';

interface MessageInputProps {
  onSendMessage: (message: string, provider: string, model: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: providers = [] } = useGetProvidersQuery();

  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0].id);
      setSelectedModel(providers[0].models[0]?.id || '');
    }
  }, [providers, selectedProvider]);

  const selectedProviderData = providers.find(p => p.id === selectedProvider);
  const availableModels = selectedProviderData?.models || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedProvider && selectedModel && !isLoading) {
      onSendMessage(message.trim(), selectedProvider, selectedModel);
      setMessage('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim() && selectedProvider && selectedModel && !isLoading && !disabled;

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="w-32">
            <Select
              value={selectedProvider}
              onValueChange={(value) => {
                setSelectedProvider(value);
                const provider = providers.find(p => p.id === value);
                setSelectedModel(provider?.models[0]?.id || '');
              }}
            >
              <SelectTrigger disabled={disabled}>
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger disabled={disabled || !selectedProvider}>
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            disabled={disabled}
            className="flex-1 resize-none min-h-[60px] max-h-[200px]"
            rows={2}
          />
          <Button
            type="submit"
            disabled={!canSend}
            size="lg"
            className="px-4"
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        
        {disabled && (
          <p className="text-sm text-muted-foreground">
            Select a conversation to start chatting
          </p>
        )}
      </form>
    </div>
  );
}