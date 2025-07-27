import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 w-full max-w-sm p-4 space-y-4">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          variant={toast.variant}
          className="relative shadow-lg"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
              {toast.description && (
                <AlertDescription>{toast.description}</AlertDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {toast.action}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismiss(toast.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}