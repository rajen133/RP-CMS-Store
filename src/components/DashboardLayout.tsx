import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { UserIcon } from "lucide-react";
import SessionTimeoutWatcher from "./sessionTimeout/SessionTimeoutHandler";

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <SessionTimeoutWatcher />
      {/* Sidebar */}
      <DashboardSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6 justify-end">
          <div className="flex items-center">
            <div className="mr-2 flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-brand-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{user?.role || "Admin"}</p>
            </div>
          </div>
        </header>

        {/* Main content area with scrolling */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
