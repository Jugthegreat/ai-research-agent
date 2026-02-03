'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: '#292524',
          border: '1px solid #44403c',
          color: '#fafaf9',
        },
      }}
    />
  );
}