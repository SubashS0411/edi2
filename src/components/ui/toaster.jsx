import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import React from 'react';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, dismiss, ...props }) => {
				return (
					<Toast key={id} {...props} className="bg-slate-900 border border-slate-700 text-white shadow-lg shadow-black/50">
						<div className="grid gap-1">
							{title && <ToastTitle className="text-emerald-400 font-semibold">{title}</ToastTitle>}
							{description && (
								<ToastDescription className="text-slate-300">{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose className="text-slate-400 hover:text-white" />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}