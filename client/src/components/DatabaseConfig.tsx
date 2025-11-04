import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface DatabaseConfigProps {
  onSave?: (config: DatabaseConfigData) => void;
}

export interface DatabaseConfigData {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export default function DatabaseConfig({ onSave }: DatabaseConfigProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<DatabaseConfigData>({
    host: "localhost",
    port: 5432,
    database: "restaurant_erp",
    username: "postgres",
    password: "",
    ssl: true,
  });

  const [copied, setCopied] = useState(false);

  const connectionString = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${config.ssl ? "?sslmode=require" : ""}`;

  const handleCopyConnectionString = () => {
    navigator.clipboard.writeText(connectionString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave?.(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database Configuration
        </CardTitle>
        <CardDescription>
          Configure your database connection settings for Supabase or PostgreSQL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Database Connection Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">Connection Settings</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Host</label>
              <Input
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="localhost or db.supabase.co"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Port</label>
              <Input
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                placeholder="5432"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Database Name</label>
              <Input
                value={config.database}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                placeholder="restaurant_erp"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="postgres"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="Enter database password"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ssl"
              checked={config.ssl}
              onChange={(e) => setConfig({ ...config, ssl: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="ssl" className="text-sm font-medium cursor-pointer">
              Use SSL Connection (Recommended for production)
            </label>
          </div>
        </div>

        {/* Connection String */}
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-semibold">Connection String</h3>
          <p className="text-sm text-muted-foreground">
            Use this connection string in your .env file as DATABASE_URL
          </p>
          <div className="relative">
            <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
              {connectionString}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyConnectionString}
              className="absolute top-2 right-2"
            >
              <Copy className="h-4 w-4 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Supabase Instructions */}
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-semibold">Supabase Setup Instructions</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Go to your Supabase project settings</li>
            <li>Copy the database connection string from the Connection section</li>
            <li>Paste it into your .env file as DATABASE_URL</li>
            <li>Make sure to enable SSL in production</li>
            <li>Run migrations: <code className="bg-muted px-2 py-1 rounded">pnpm db:push</code></li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 border-t pt-4">
          <Button onClick={handleSave}>Save Configuration</Button>
          <Button variant="outline">Test Connection</Button>
        </div>
      </CardContent>
    </Card>
  );
}
