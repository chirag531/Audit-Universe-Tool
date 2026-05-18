import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: "!rounded-lg !border !border-slate-200 !bg-white !text-slate-900 !shadow-card-md !text-sm",
      }}
    />
  );
}
