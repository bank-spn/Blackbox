import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import POS from "./pages/POS";
import Cashier from "./pages/Cashier";
import Inventory from "./pages/Inventory";
import Employees from "./pages/Employees";
import Tables from "./pages/Tables";
import Reports from "./pages/Reports";
import FinancialManagement from "./pages/FinancialManagement";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/menu"} component={Menu} />
      <Route path={"/pos"} component={POS} />
      <Route path={"/cashier"} component={Cashier} />
      <Route path={"/inventory"} component={Inventory} />
      <Route path={"/employees"} component={Employees} />
      <Route path={"/tables"} component={Tables} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/financial"} component={FinancialManagement} />
      <Route path={"/audit-log"} component={AuditLog} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <LanguageProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
