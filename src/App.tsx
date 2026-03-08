import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LedgerProvider } from "@/contexts/LedgerContext";
import BottomNav from "@/components/BottomNav";
import AddTransactionFAB from "@/components/AddTransactionFAB";
import Dashboard from "./pages/Dashboard";
import AccountsPage from "./pages/AccountsPage";
import BakiPage from "./pages/BakiPage";
import TransactionsPage from "./pages/TransactionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LedgerProvider>
        <BrowserRouter>
          <div className="max-w-lg mx-auto min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/baki" element={<BakiPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AddTransactionFAB />
            <BottomNav />
          </div>
        </BrowserRouter>
      </LedgerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
