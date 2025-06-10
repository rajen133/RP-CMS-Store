import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context Providers
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { OrderProvider } from "./context/OrderContext";
import { CustomerProvider } from "./context/CustomerContext";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import UpdatePasswordPage from "@/pages/auth/UpdatePasswordPage";

// Dashboard Pages
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProductsPage from "@/pages/dashboard/ProductsPage";
import OrdersPage from "@/pages/dashboard/OrdersPage";
import CustomersPage from "@/pages/dashboard/CustomersPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import DashboardNotFoundPage from "@/pages/dashboard/NotFoundPage";

// Other Pages
import NotFound from "@/pages/NotFound";
import RequireAuth from "@/components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProductProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/auth/update-password"
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
          </BrowserRouter>
        </TooltipProvider>
      </ProductProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
