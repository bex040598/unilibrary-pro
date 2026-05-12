"use client";

import { useMemo, useState } from "react";
import { IdCard, ScanLine, ShieldCheck } from "lucide-react";

import { Badge, Button, Card, Input, SectionTitle } from "@/components/ui/primitives";
import { ScannerMock } from "@/components/ui/scanner-mock";
import { AppStore } from "@/features/store/useAppStore";
import { formatCurrency } from "@/lib/utils";
import { User } from "@/types";

export function IdentityVerificationPanel({
  state,
  actorId,
  purpose,
  onResolved
}: {
  state: AppStore;
  actorId: string;
  purpose: string;
  onResolved?: (user: User | null) => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [resolvedUserId, setResolvedUserId] = useState<string>("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationTone, setVerificationTone] = useState<"emerald" | "gold" | "rose" | "cyan">("cyan");

  const user = useMemo(
    () =>
      state.users.find(
        (item) =>
          item.id === resolvedUserId ||
          item.studentId?.toLowerCase() === identifier.toLowerCase() ||
          item.email.toLowerCase() === identifier.toLowerCase() ||
          item.membershipNumber.toLowerCase() === identifier.toLowerCase() ||
          item.cardQrCode.toLowerCase() === identifier.toLowerCase()
      ) ?? null,
    [identifier, resolvedUserId, state.users]
  );

  const activeLoans = user ? state.loans.filter((item) => item.userId === user.id && item.status !== "returned").length : 0;
  const unpaidFines = user
    ? state.fines
        .filter((item) => item.userId === user.id && item.status !== "paid" && item.status !== "waived")
        .reduce((acc, item) => acc + item.amount, 0)
    : 0;

  return (
    <Card className="space-y-4">
      <SectionTitle title="Verify student identity" description="Student ID, QR card va Face ID mock orqali shaxsni tasdiqlash." />
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="Student ID, email, membership yoki QR value"
        />
        <Button
          variant="secondary"
          onClick={() => {
            const matchedUser =
              state.users.find(
                (item) =>
                  item.studentId?.toLowerCase() === identifier.toLowerCase() ||
                  item.email.toLowerCase() === identifier.toLowerCase() ||
                  item.membershipNumber.toLowerCase() === identifier.toLowerCase() ||
                  item.cardQrCode.toLowerCase() === identifier.toLowerCase()
              ) ?? null;
            setResolvedUserId(matchedUser?.id ?? "");
            setVerificationMessage(matchedUser ? "QR / ID match topildi." : "Foydalanuvchi topilmadi.");
            setVerificationTone(matchedUser ? "cyan" : "rose");
            onResolved?.(matchedUser);
          }}
        >
          <IdCard className="h-4 w-4" />
          Identify
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const matchedUser =
              state.users.find(
                (item) =>
                  item.studentId?.toLowerCase() === identifier.toLowerCase() ||
                  item.cardQrCode.toLowerCase() === identifier.toLowerCase()
              ) ?? null;
            if (!matchedUser) {
              setVerificationMessage("QR scan orqali foydalanuvchi topilmadi.");
              setVerificationTone("rose");
              onResolved?.(null);
              return;
            }
            state.logIdentityVerification({
              actorId,
              userId: matchedUser.id,
              method: "qr_card",
              result: "verified",
              confidence: "high",
              purpose,
              details: "QR student card scan"
            });
            setResolvedUserId(matchedUser.id);
            setVerificationMessage("QR student card tasdiqlandi.");
            setVerificationTone("emerald");
            onResolved?.(matchedUser);
          }}
        >
          <ScanLine className="h-4 w-4" />
          Scan QR
        </Button>
      </div>
      {identifier ? <ScannerMock title="Student QR / card channel" code={identifier} mode="QR" /> : null}
      {user ? (
        <div className="space-y-4 rounded-3xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-ink">{user.fullName}</p>
              <p className="text-sm text-slate-500">{user.studentId ?? user.employeeId} • {user.faculty}</p>
            </div>
            <Badge tone={user.status === "active" ? "emerald" : "rose"}>{user.status}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-600">
            <p>Borrowing limit: {user.role === "teacher" ? 10 : 5}</p>
            <p>Active loans: {activeLoans}</p>
            <p>Unpaid fines: {formatCurrency(unpaidFines)}</p>
            <p>Membership: {user.membershipNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                const result = state.verifyStudentIdentity({
                  actorId,
                  userId: user.id,
                  identifier: user.email,
                  purpose
                });
                setVerificationMessage(result.message);
                setVerificationTone(
                  result.result === "matched" || result.result === "verified"
                    ? "emerald"
                    : result.result === "no_biometric"
                      ? "gold"
                      : "rose"
                );
              }}
            >
              <ShieldCheck className="h-4 w-4" />
              Face ID verification
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                state.logIdentityVerification({
                  actorId,
                  userId: user.id,
                  method: "manual",
                  result: "verified",
                  confidence: "medium",
                  purpose,
                  details: "Manual staff verification fallback"
                });
                setVerificationMessage("Manual fallback verification qayd etildi.");
                setVerificationTone("cyan");
              }}
            >
              Manual fallback
            </Button>
          </div>
        </div>
      ) : null}
      {verificationMessage ? <Badge tone={verificationTone}>{verificationMessage}</Badge> : null}
    </Card>
  );
}
