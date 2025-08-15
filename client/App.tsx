import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/contexts/StaticAuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AllTenders from "./pages/AllTenders";
import CompanyRegistration from "./pages/CompanyRegistration";
import Login from "./pages/Login";
import CompanyDashboard from "./pages/CompanyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperUserDashboard from "./pages/SuperUserDashboard";
import MinistryDashboard from "./pages/MinistryDashboard";
import FirebaseSetup from "./pages/FirebaseSetup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tenders" element={<AllTenders />} />
            <Route path="/register" element={<CompanyRegistration />} />
            <Route path="/login" element={<Login />} />
            {/* Redirect old login routes to unified login */}
            <Route
              path="/admin/login"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/superuser/login"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/ministry/login"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute requiredRole="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ministry/dashboard"
              element={
                <ProtectedRoute requiredRole="ministry">
                  <MinistryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superuser/dashboard"
              element={
                <ProtectedRoute requiredRole="superuser">
                  <SuperUserDashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root")!;
let root = (container as any)._reactRoot;

if (!root) {
  root = createRoot(container);
  (container as any)._reactRoot = root;
}

root.render(<App />);
