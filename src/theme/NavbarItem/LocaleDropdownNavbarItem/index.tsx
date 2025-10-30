import React from "react";
import OriginalLocaleDropdownNavbarItem from "@theme-original/NavbarItem/LocaleDropdownNavbarItem";
import { useLocation } from "@docusaurus/router";
import { normalizePath } from "@site/src/utils/utils";

export default function LocaleDropdownNavbarItemWrapper(props) {
  const location = useLocation();
  const normalizedPath = normalizePath(location.pathname);

  if (
    normalizedPath.startsWith("/docs/en/developer") ||
    normalizedPath.startsWith("/docs/developer") ||
    normalizedPath === "/docs" ||
    normalizedPath === "/docs/en"
  ) {
    return null;
  }

  return <OriginalLocaleDropdownNavbarItem {...props} />;
}
