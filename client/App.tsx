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
import CompanyDashboardModern from "./pages/CompanyDashboardModern";
import AdminDashboard from "./pages/AdminDashboard";
import SuperUserDashboard from "./pages/SuperUserDashboard";
import MinistryDashboard from "./pages/MinistryDashboard";
import MinistryReports from "./pages/MinistryReports";
import FinanceDashboard from "./pages/FinanceDashboard";
import UserLogin from "./pages/UserLogin";
import UserDashboard from "./pages/UserDashboard";
import GovernorDashboard from "./pages/GovernorDashboard";
// Firebase setup page removed for localStorage-only mode
import ProcurementWorkflowValidation from "./pages/ProcurementWorkflowValidation";
import TenderStatusDemo from "./pages/TenderStatusDemo";
import TenderScoring from "./pages/TenderScoring";
import TenderResults from "./pages/TenderResults";
import { performFullMigration } from "@/lib/tenderMigration";
import { runCleanupIfNeeded } from "@/lib/globalKeyCleanup";
import { logVerificationReport } from "@/lib/ministryIsolationVerification";
import { logFilteringTest } from "@/lib/ministryFilteringTest";

// Trigger tender system migration on app startup
try {
  performFullMigration();
  // Clean up legacy global keys to prevent ministry data leakage
  runCleanupIfNeeded();
  // Verify ministry data isolation is working properly
  setTimeout(() => {
    logVerificationReport();
    logFilteringTest(); // Test ministry filtering logic
  }, 1000); // Delay to let initial data load
} catch (error) {
  console.error("Error during tender migration:", error);
}

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
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute requiredRole="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/dashboard/modern"
              element={
                <ProtectedRoute requiredRole="company">
                  <CompanyDashboardModern />
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
              path="/ministry/reports"
              element={
                <ProtectedRoute requiredRole="ministry">
                  <MinistryReports />
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
            <Route
              path="/finance/dashboard"
              element={
                <ProtectedRoute requiredRole="ministry">
                  <FinanceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/governor/dashboard"
              element={
                <ProtectedRoute requiredRole="governor">
                  <GovernorDashboard />
                </ProtectedRoute>
              }
            />
            {/* Firebase setup removed */}
            <Route
              path="/validation"
              element={<ProcurementWorkflowValidation />}
            />
            <Route path="/tender-status-demo" element={<TenderStatusDemo />} />
            <Route
              path="/tender-scoring/:tenderId"
              element={
                <ProtectedRoute requiredRole="ministry">
                  <TenderScoring />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tender-results/:tenderId"
              element={
                <ProtectedRoute requiredRole="ministry">
                  <TenderResults />
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
