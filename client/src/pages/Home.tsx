import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to dashboard immediately
    setLocation("/dashboard");
  }, [setLocation]);

  return null;
}
