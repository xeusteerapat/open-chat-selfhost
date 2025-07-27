import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Open Chat</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Manage your chat conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Total conversations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Configure your AI provider keys</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Configured providers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>Total messages sent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Messages this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}