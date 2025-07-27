import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConversationSidebar from './ConversationSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useGetConversationQuery, useSendMessageMutation } from '@/store/api/conversationsApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Conversation } from '@/types';

export default function ChatInterface() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: conversationData, isLoading: isLoadingConversation } = useGetConversationQuery(
    selectedConversation?.id!,
    { skip: !selectedConversation }
  );
  
  const [sendMessage, { isLoading: isSendingMessage }] = useSendMessageMutation();

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setError(null); // Clear any previous errors
  };

  const handleNewConversation = () => {
    // Conversation created, will be handled by sidebar
  };

  const handleDeleteConversation = (conversationId: number) => {
    // If the deleted conversation was selected, clear the selection
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
      setError(null); // Clear any errors
    }
  };

  const handleSendMessage = async (message: string, provider: string, model: string) => {
    if (!selectedConversation) return;
    
    setError(null); // Clear any previous errors
    
    try {
      await sendMessage({
        conversationId: selectedConversation.id,
        data: {
          content: message,
          provider,
          model,
        },
      }).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as { error?: string };
        if (errorData?.error) {
          errorMessage = errorData.error;
          
          // Check if it's an API key or server error
          if ((errorMessage.includes('API key') && errorMessage.includes('not found')) || 
              (provider === 'ollama' && (errorMessage.includes('server') || errorMessage.includes('connection')))) {
            const isOllama = provider === 'ollama';
            setError(`Missing ${isOllama ? 'server URL' : 'API key'} for ${provider}. Please add your ${isOllama ? 'server URL' : 'API key'} to continue.`);
            toast({
              title: isOllama ? 'Ollama Server Required' : 'API Key Required',
              description: isOllama 
                ? `You need to configure your Ollama server URL to send messages.`
                : `You need to add an API key for ${provider} to send messages.`,
              variant: 'destructive',
              action: (
                <Button asChild variant="outline" size="sm">
                  <Link to="/api-keys">{isOllama ? 'Add Server URL' : 'Add API Key'}</Link>
                </Button>
              ),
            });
            return;
          }
        }
      }
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-[calc(100vh-81px)] flex">
      <ConversationSidebar
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="border-b p-4 bg-background">
              <h2 className="font-semibold text-lg">{selectedConversation.title}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedConversation.provider} • {selectedConversation.model}
              </p>
            </div>
            
            <MessageList
              messages={conversationData?.messages || []}
              isLoading={isLoadingConversation || isSendingMessage}
            />
            
            {error && (
              <div className="p-4 border-t">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    {error}
                    {error.includes('API key') && (
                      <Button asChild variant="outline" size="sm" className="ml-2">
                        <Link to="/api-keys">Add API Key</Link>
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isSendingMessage}
              disabled={false}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to Open Chat</h2>
              <p className="text-muted-foreground max-w-md">
                Select a conversation from the sidebar or create a new one to start chatting with AI.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}