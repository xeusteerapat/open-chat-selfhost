import { ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold hover:text-primary">
              Open Chat
            </Link>
            {user && (
              <nav className="flex items-center space-x-4">
                <Link
                  to="/"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/chat" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Chat
                </Link>
                <Link
                  to="/api-keys"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/api-keys" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  API Keys
                </Link>
                <Link
                  to="/settings"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/settings" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Settings
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.username}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className={cn(
        location.pathname === "/chat" 
          ? "" 
          : "container mx-auto px-4 py-8"
      )}>
        {children}
      </main>
    </div>
  );
}