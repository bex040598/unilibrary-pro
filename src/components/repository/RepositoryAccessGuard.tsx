"use client";

import { ReactNode } from "react";

import { AccessPolicyBadge } from "@/components/repository/AccessPolicyBadge";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { getRepositoryAccessDecision } from "@/lib/repositoryAccess";
import { DigitalResource, User } from "@/types";

export function RepositoryAccessGuard({
  resource,
  user,
  children,
  onOpen,
  onDownload,
  onRequestAccess,
  compact = false
}: {
  resource: DigitalResource;
  user?: User | null;
  children?: ReactNode;
  onOpen?: () => void;
  onDownload?: () => void;
  onRequestAccess?: () => void;
  compact?: boolean;
}) {
  const decision = getRepositoryAccessDecision(resource, user);

  return (
    <Card className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-center gap-2">
        <AccessPolicyBadge resource={resource} />
        <Badge tone={decision.tone}>{decision.stateLabel}</Badge>
      </div>
      <p className="text-sm text-slate-600">{decision.reason}</p>
      {children}
      <div className="flex flex-wrap gap-2">
        {decision.canOpen ? (
          <Button onClick={onOpen}>Open</Button>
        ) : null}
        {decision.canDownload ? (
          <Button variant="secondary" onClick={onDownload}>
            Download
          </Button>
        ) : null}
        {!decision.canOpen && !decision.canDownload ? (
          <Badge tone={decision.tone}>Metadata preview only</Badge>
        ) : null}
        {decision.canRequestAccess && onRequestAccess ? (
          <Button variant="secondary" onClick={onRequestAccess}>
            Ruxsat so&apos;rovi yuborish
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
