import { useState } from "react";
import { Link } from "react-router";
import getErrorConfig from "../components/Error/ErrorConfig";
import Login from "../components/Login/login";
import { useAuth } from "../hooks/useAuth";
import Employees from "../components/Admin/Employees";
import AdminReports from "../components/Admin/AdminReports";
import ControlPanel from "../components/Admin/ControlPanel";

import AdminHeader from "../components/Headers/AdminHeader";
import TabSelector from "../components/ui/TabSelector";

export default function Admin() {
  const { isAuthenticated, hasRole } = useAuth();
  const config = getErrorConfig("unauthorized");
  const [tab, setTab] = useState<"employees" | "reports" | "control">(
    "reports"
  );
  
  if (!isAuthenticated) {
    return <Login />;
  }
  if (!hasRole("admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-xl p-4 text-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className={config.color}>{config.icon}</div>
            <h3 className="font-medium text-foreground">{config.title}</h3>
          </div>
          <p className="text-sm text-foreground/70 mb-4">{config.message}</p>
          <Link
            to="/"
            className="text-sm  bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 space-y-6">
      <AdminHeader />
      <div className="px-4 space-y-3">
        <TabSelector Tabs={["reports", "employees", "control"]} activeTab={tab} onTabChange={setTab} />
      </div>

      <div>
        {tab === "reports" && <AdminReports />}
        {tab === "employees" && <Employees />}
        {tab === "control" && <ControlPanel />}
      </div>

     
    </div>
  );
}
