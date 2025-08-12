import type { ToastOptions } from 'react-hot-toast';

export const toastConfig: ToastOptions = {
  position: 'top-right',
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    padding: '12px 16px',
  },
};

export const showSuccessToast = (message: string) => {
  import('react-hot-toast').then(({ toast }) => {
    toast.success(message, {
      ...toastConfig,
      duration: 3000,
      style: {
        ...toastConfig.style,
        background: '#10b981',
      },
    });
  });
};

export const showErrorToast = (message: string) => {
  import('react-hot-toast').then(({ toast }) => {
    toast.error(message, {
      ...toastConfig,
      duration: 4000,
      style: {
        ...toastConfig.style,
        background: '#ef4444',
      },
    });
  });
};

export const showLoadingToast = (message: string) => {
  import('react-hot-toast').then(({ toast }) => {
    return toast.loading(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: '#6366f1',
      },
    });
  });
};
