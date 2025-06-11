import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Context Providers
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { OrderProvider } from "./context/OrderContext";
import { CustomerProvider } from "./context/CustomerContext";

// Auth Pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage")
);
const UpdatePasswordPage = lazy(
  () => import("@/pages/auth/UpdatePasswordPage")
);

// Dashboard Pages
const DashboardLayout = lazy(() => import("@/components/DashboardLayout"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const ProductsPage = lazy(() => import("@/pages/dashboard/ProductsPage"));
const OrdersPage = lazy(() => import("@/pages/dashboard/OrdersPage"));
const CustomersPage = lazy(() => import("@/pages/dashboard/CustomersPage"));
const SettingsPage = lazy(() => import("@/pages/dashboard/SettingsPage"));
const DashboardNotFoundPage = lazy(
  () => import("@/pages/dashboard/NotFoundPage")
);

// Other Pages
const NotFound = lazy(() => import("@/pages/NotFound"));
const RequireAuth = lazy(() => import("@/components/RequireAuth"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProductProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password"
                  element={<UpdatePasswordPage />}
                />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <DashboardLayout />
                    </RequireAuth>
                  }
                >
                  <Route
                    index
                    element={
                      <OrderProvider>
                        <CustomerProvider>
                          <DashboardPage />
                        </CustomerProvider>
                      </OrderProvider>
                    }
                  />
                  <Route path="products" element={<ProductsPage />} />
                  <Route
                    path="orders"
                    element={
                      <OrderProvider>
                        <OrdersPage />
                      </OrderProvider>
                    }
                  />
                  <Route
                    path="customers"
                    element={
                      <CustomerProvider>
                        <CustomersPage />
                      </CustomerProvider>
                    }
                  />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<DashboardNotFoundPage />} />
                </Route>

                {/* Catch all unmatched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ProductProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
