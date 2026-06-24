import React from "react";
import OriginalLocaleDropdownNavbarItem from "@theme-original/NavbarItem/LocaleDropdownNavbarItem";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  localeFromPathname,
  setStoredLocale,
} from "@site/src/utils/locale";

// Persist the chosen language before Docusaurus performs the (hard) locale
// switch, so the synchronous <head> script keeps that choice on the next load.
export default function LocaleDropdownNavbarItemWrapper(props) {
  const { siteConfig } = useDocusaurusContext();

  const handleClickCapture = (event: React.MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href) return;
    try {
      const { pathname } = new URL(href, window.location.origin);
      setStoredLocale(localeFromPathname(pathname, siteConfig.baseUrl));
    } catch {
      /* ignore malformed hrefs */
    }
  };

  return (
    <span onClickCapture={handleClickCapture}>
      <OriginalLocaleDropdownNavbarItem {...props} />
    </span>
  );
}
