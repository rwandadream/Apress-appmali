import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { Loader2 } from "lucide-react";

// Lazy loading remaining components
const Reports = lazy(() => import("@/pages/Reports"));
const Clients = lazy(() => import("@/pages/Clients"));
const Services = lazy(() => import("@/pages/Services"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const NewInvoice = lazy(() => import("@/pages/NewInvoice"));
const InvoiceDetail = lazy(() => import("@/pages/InvoiceDetail"));
const Payments = lazy(() => import("@/pages/Payments"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const ActivityPage = lazy(() => import("@/pages/ActivityPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" attribute="class">
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/new" element={<NewInvoice />} />
                    <Route path="/invoices/:id" element={<InvoiceDetail />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/users" element={<ProtectedRoute requireSuperviseur><UsersPage /></ProtectedRoute>} />
                    <Route path="/activity" element={<ProtectedRoute requireSuperviseur><ActivityPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
