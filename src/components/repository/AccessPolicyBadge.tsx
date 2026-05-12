"use client";

import { Badge } from "@/components/ui/primitives";
import { DigitalResource } from "@/types";

export function AccessPolicyBadge({
  resource,
  level
}: {
  resource?: DigitalResource;
  level?: DigitalResource["accessLevel"];
}) {
  const accessLevel = resource?.accessLevel ?? level ?? "restricted";
  const tone =
    accessLevel === "public"
      ? "emerald"
      : accessLevel === "restricted"
        ? "rose"
        : accessLevel === "university only" || accessLevel === "staff only"
          ? "cyan"
          : "gold";
  return <Badge tone={tone}>{accessLevel}</Badge>;
}
