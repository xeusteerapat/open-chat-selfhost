import { useState, useCallback } from 'react';

interface Toast {
	id: string;
	title?: string;
	description?: string;
	variant?: 'default' | 'destructive';
	action?: React.ReactNode;
}

interface ToastOptions {
	title?: string;
	description?: string;
	variant?: 'default' | 'destructive';
	action?: React.ReactNode;
}

let toastId = 0;

export const useToast = () => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const toast = useCallback((options: ToastOptions) => {
		const id = (++toastId).toString();
		const newToast: Toast = {
			id,
			...options,
		};

		setToasts((prev) => [...prev, newToast]);

		// Auto-remove toast after 5 seconds
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 5000);

		return {
			id,
			dismiss: () => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			},
		};
	}, []);

	const dismiss = useCallback((toastId: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== toastId));
	}, []);

	return {
		toast,
		dismiss,
		toasts,
	};
};
