import React, { useEffect } from "react";
import { useLocation } from "@docusaurus/router";

export default function DeveloperRedirect() {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.startsWith("/docs/en/")) return;
    const newPath = currentPath.replace(/^\/docs\//, "/docs/en/");
    window.location.replace(newPath);
  }, [location]);

  return null;
}
