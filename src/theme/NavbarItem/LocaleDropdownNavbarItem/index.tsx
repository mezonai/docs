import React from "react";
import OriginalLocaleDropdownNavbarItem from "@theme-original/NavbarItem/LocaleDropdownNavbarItem";
import { useLocation } from "@docusaurus/router";

export default function LocaleDropdownNavbarItemWrapper(props) {
  const location = useLocation();

  if (location.pathname.startsWith("/docs/en/developer")) {
    return null;
  }

  return <OriginalLocaleDropdownNavbarItem {...props} />;
}
