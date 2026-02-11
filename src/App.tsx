import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { router } from "./router";
import { useEffect } from "react";
import { initSessionMonitor } from "./services/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function App() {
  useEffect(() => {
    initSessionMonitor();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" closeButton expand visibleToasts={3} />
    </QueryClientProvider>
  );
}

export default App;
