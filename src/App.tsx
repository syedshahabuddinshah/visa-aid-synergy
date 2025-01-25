import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecommendationsProvider } from "./contexts/RecommendationsContext";
import { Toaster } from "./components/ui/toaster";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecommendationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </RecommendationsProvider>
    </QueryClientProvider>
  );
}

export default App;