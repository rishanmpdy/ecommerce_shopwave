import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from "react-toastify";

import "./index.css";
import App from "./App.jsx";
import store from "./Store/store.js"; 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      staleTime: 5 * 60 * 1000, 
    },
  },
});

//A1 (Application Entry Point: React root render cheyyukayum essential providers like Redux, React Query, and Router setup cheyyukayum cheyyunnu)
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <App />
          <ToastContainer position="bottom-left" autoClose={2000} />
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
