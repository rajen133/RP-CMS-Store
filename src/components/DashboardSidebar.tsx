import React from "react";
import logo from "@/assets/img/logo.jpg";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      name: "Products",
      icon: <Package className="h-5 w-5" />,
      href: "/dashboard/products",
    },
    {
      name: "Orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/dashboard/orders",
    },
    {
      name: "Customers",
      icon: <Users className="h-5 w-5" />,
      href: "/dashboard/customers",
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    if (path !== "/dashboard" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <Link
              to="/dashboard"
              className="flex items-center"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-10 h-8 bg-brand-600 rounded-md flex items-center justify-center">
                <img
                  src={logo}
                  alt="logo"
                  className="mx-auto h-12 w-12 bg-brand-600 rounded-lg flex items-center justify-center"
                />
              </div>
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                RP-CMS Store
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: cn(
                    "mr-3 h-5 w-5",
                    isActive(item.href) ? "text-brand-700" : "text-gray-400"
                  ),
                })}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center text-gray-700"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
