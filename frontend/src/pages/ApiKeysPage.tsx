import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useGetApiKeysQuery, useCreateApiKeyMutation, useDeleteApiKeyMutation } from '@/store/api/apiKeysApi';
import { useToast } from '@/hooks/use-toast';

export default function ApiKeysPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    provider: '',
    keyName: '',
    apiKey: '',
  });
  const { toast } = useToast();

  const { data: apiKeys, isLoading } = useGetApiKeysQuery();
  const [createApiKey, { isLoading: isCreating }] = useCreateApiKeyMutation();
  const [deleteApiKey] = useDeleteApiKeyMutation();

  const providers = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-3.5, GPT-4, and other OpenAI models' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude models' },
    { id: 'openrouter', name: 'OpenRouter', description: 'Access to multiple AI models' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyData.provider || !newKeyData.keyName || !newKeyData.apiKey) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createApiKey(newKeyData).unwrap();
      setNewKeyData({ provider: '', keyName: '', apiKey: '' });
      setIsAdding(false);
      toast({
        title: 'Success',
        description: 'API key added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add API key',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      await deleteApiKey(id).unwrap();
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">API Keys</h1>
            <p className="text-muted-foreground mt-2">
              Manage your AI provider API keys securely
            </p>
          </div>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="w-4 h-4 mr-2" />
            Add API Key
          </Button>
        </div>

        {/* Provider Information */}
        <div className="grid gap-4 md:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                <CardDescription className="text-sm">
                  {provider.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {apiKeys?.filter(key => key.provider === provider.id).length || 0} key(s) configured
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New API Key Form */}
        {isAdding && (
          <Card>
            <CardHeader>
              <CardTitle>Add New API Key</CardTitle>
              <CardDescription>
                Add a new API key for accessing AI providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select
                      value={newKeyData.provider}
                      onValueChange={(value) => setNewKeyData({ ...newKeyData, provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
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
                  <div className="space-y-2">
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., My OpenAI Key"
                      value={newKeyData.keyName}
                      onChange={(e) => setNewKeyData({ ...newKeyData, keyName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">API Key</Label>
                  <Input
                    id="key"
                    type="password"
                    placeholder="Enter your API key"
                    value={newKeyData.apiKey}
                    onChange={(e) => setNewKeyData({ ...newKeyData, apiKey: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Adding...' : 'Add Key'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewKeyData({ provider: '', keyName: '', apiKey: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing API Keys */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Manage your existing API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!apiKeys || apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API keys configured. Add one to start using AI providers.
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{apiKey.keyName}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {apiKey.provider}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground">
                          API key is securely stored
                        </code>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(apiKey.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}