import React from "react";
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import styles from "./styles.module.css";

export type PlatformType =
  | "all"
  | "phone"
  | "android"
  | "iphone"
  | "computer"
  | "web"
  | "desktop";

const PLATFORM_LABELS: Record<PlatformType, { id: string; default: string }> = {
  all: { id: "badge.platform.all", default: "All platforms" },
  phone: { id: "badge.platform.phone", default: "Phone" },
  android: { id: "badge.platform.android", default: "Android" },
  iphone: { id: "badge.platform.iphone", default: "iPhone" },
  computer: { id: "badge.platform.computer", default: "Computer" },
  web: { id: "badge.platform.web", default: "Web" },
  desktop: { id: "badge.platform.desktop", default: "Desktop" },
};

export function PlatformBadge({ type }: { type: PlatformType }) {
  const meta = PLATFORM_LABELS[type] ?? PLATFORM_LABELS.all;
  return (
    <span className={clsx(styles.badge, styles[`platform_${type}`])}>
      <Translate id={meta.id}>{meta.default}</Translate>
    </span>
  );
}

export type PlanType = "free" | "user-pro" | "clan-pro" | "pro";

const PLAN_LABELS: Record<PlanType, { id: string; default: string }> = {
  free: { id: "badge.plan.free", default: "Free" },
  "user-pro": { id: "badge.plan.userPro", default: "User Pro" },
  "clan-pro": { id: "badge.plan.clanPro", default: "Clan Pro" },
  pro: { id: "badge.plan.pro", default: "Pro" },
};

export function PlanBadge({ plan = "pro" }: { plan?: PlanType }) {
  const meta = PLAN_LABELS[plan] ?? PLAN_LABELS.pro;
  return (
    <span className={clsx(styles.badge, styles[`plan_${plan.replace("-", "_")}`])}>
      <Translate id={meta.id}>{meta.default}</Translate>
    </span>
  );
}

export type ApiMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "WS"
  | "TCP"
  | "RPC";

export function ApiBadge({
  method,
  path,
}: {
  method: ApiMethod;
  path?: string;
}) {
  return (
    <span className={styles.apiWrapper}>
      <span className={clsx(styles.apiMethod, styles[`method_${method}`])}>
        {method}
      </span>
      {path && <code className={styles.apiPath}>{path}</code>}
    </span>
  );
}

export function BotAccessBadge({
  allowed,
  note,
}: {
  allowed: boolean;
  note?: string;
}) {
  return (
    <span
      className={clsx(
        styles.badge,
        allowed ? styles.accessAllowed : styles.accessDenied
      )}
    >
      {allowed ? (
        <Translate id="badge.botAccess.allowed">Allowed</Translate>
      ) : (
        <Translate id="badge.botAccess.denied">Blocked</Translate>
      )}
      {note ? ` · ${note}` : ""}
    </span>
  );
}
