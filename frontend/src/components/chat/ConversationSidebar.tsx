import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Settings, Key, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGetConversationsQuery, useCreateConversationMutation, useDeleteConversationMutation, useUpdateConversationMutation } from '@/store/api/conversationsApi';
import { useGetProvidersQuery } from '@/store/api/providersApi';
import type { Conversation } from '@/types';

interface ConversationSidebarProps {
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (conversationId: number) => void;
}

export default function ConversationSidebar({
  selectedConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationSidebarProps) {
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useGetConversationsQuery();
  const { data: providers = [] } = useGetProvidersQuery();
  const [createConversation] = useCreateConversationMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleNewConversation = async () => {
    if (providers.length === 0) return;
    
    try {
      const result = await createConversation({
        title: 'New Conversation',
        provider: providers[0]?.id || 'openai',
        model: providers[0]?.models[0]?.id || 'gpt-3.5-turbo',
      }).unwrap();
      
      onSelectConversation(result);
      onNewConversation();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation when clicking delete
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    setDeletingId(conversationId);
    
    try {
      await deleteConversation(conversationId).unwrap();
      
      // Notify parent component about the deletion
      onDeleteConversation?.(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditConversation = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation when clicking edit
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = async (conversationId: number, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    
    if (!editTitle.trim()) {
      return;
    }

    try {
      await updateConversation({
        id: conversationId,
        data: { title: editTitle.trim() }
      }).unwrap();
      
      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent, conversationId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(conversationId, e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit(e);
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 border-r bg-muted/10 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-muted/10 flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={handleNewConversation} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start a new chat to get going</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`group relative p-3 cursor-pointer transition-colors hover:bg-accent ${
                selectedConversation?.id === conversation.id ? 'bg-accent' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="space-y-1 pr-16">
                {editingId === conversation.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleTitleKeyDown(e, conversation.id)}
                    className="font-medium text-sm h-6 p-1"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                )}
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="capitalize">{conversation.provider}</span>
                  <span className="mx-1">•</span>
                  <span>{conversation.model}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </p>
              </div>
              
              {/* Action buttons - only show on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === conversation.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-green-500 hover:text-white"
                      onClick={(e) => handleSaveEdit(conversation.id, e)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-500 hover:text-white"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-blue-500 hover:text-white"
                      onClick={(e) => handleEditConversation(conversation, e)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      disabled={deletingId === conversation.id}
                    >
                      {deletingId === conversation.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
      
      <div className="p-4 border-t space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start" 
          onClick={() => navigate('/api-keys')}
        >
          <Key className="w-4 h-4 mr-2" />
          API Keys
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start" 
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}