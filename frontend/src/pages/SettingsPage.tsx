import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function SettingsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user?.username || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Preferences</CardTitle>
            <CardDescription>
              Customize your chat experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Provider</Label>
              <p className="text-sm text-muted-foreground">
                Feature coming soon - set your preferred AI provider
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Default Model</Label>
              <p className="text-sm text-muted-foreground">
                Feature coming soon - set your preferred AI model
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Message History</Label>
              <p className="text-sm text-muted-foreground">
                Feature coming soon - configure message retention settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Change Password</Label>
              <p className="text-sm text-muted-foreground">
                Feature coming soon - update your account password
              </p>
              <Button variant="outline" disabled>
                Change Password
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Feature coming soon - enable 2FA for enhanced security
              </p>
              <Button variant="outline" disabled>
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage your data and account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground">
                Download all your conversations and data
              </p>
              <Button variant="outline" disabled>
                Export Data
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-destructive">Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}