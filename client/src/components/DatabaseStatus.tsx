import { useEffect, useState } from "react";
import { Database, AlertCircle, CheckCircle, Loader } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DatabaseStatusType = "connected" | "disconnected" | "checking";

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatusType>("checking");
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        setStatus("checking");
        // In a real app, this would call an API endpoint to check DB status
        // For now, we'll simulate a successful connection
        const response = await fetch("/api/health", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }).catch(() => null);

        if (response?.ok) {
          setStatus("connected");
        } else {
          setStatus("disconnected");
        }
      } catch {
        setStatus("disconnected");
      } finally {
        setLastChecked(new Date());
      }
    };

    checkDatabaseStatus();

    // Check every 30 seconds
    const interval = setInterval(checkDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      case "checking":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <CheckCircle className={`h-4 w-4 ${getStatusColor()}`} />;
      case "disconnected":
        return <AlertCircle className={`h-4 w-4 ${getStatusColor()}`} />;
      case "checking":
        return <Loader className={`h-4 w-4 ${getStatusColor()} animate-spin`} />;
      default:
        return <Database className={`h-4 w-4 ${getStatusColor()}`} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Database Connected";
      case "disconnected":
        return "Database Disconnected";
      case "checking":
        return "Checking Database...";
      default:
        return "Unknown";
    }
  };

  const getStatusDescription = () => {
    const time = lastChecked.toLocaleTimeString();
    switch (status) {
      case "connected":
        return `Connected and operational (Last checked: ${time})`;
      case "disconnected":
        return `Connection failed. Check your database configuration. (Last checked: ${time})`;
      case "checking":
        return "Verifying connection...";
      default:
        return "Status unknown";
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
          {getStatusIcon()}
          <span className="text-xs font-medium hidden sm:inline">{getStatusText()}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{getStatusText()}</p>
          <p className="text-xs text-muted-foreground">{getStatusDescription()}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
