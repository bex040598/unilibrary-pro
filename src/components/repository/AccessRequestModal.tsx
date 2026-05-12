"use client";

import { FormEvent, useState } from "react";

import { Button, Input, Label, Modal, Textarea } from "@/components/ui/primitives";

export function AccessRequestModal({
  open,
  onClose,
  resourceTitle,
  defaultName = "",
  defaultEmail = "",
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  resourceTitle: string;
  defaultName?: string;
  defaultEmail?: string;
  onSubmit: (payload: { requesterName: string; requesterEmail: string; reason: string }) => void;
}) {
  const [requesterName, setRequesterName] = useState(defaultName);
  const [requesterEmail, setRequesterEmail] = useState(defaultEmail);
  const [reason, setReason] = useState("Ilmiy ish va o'quv jarayonida foydalanish uchun ruxsat so'rayman.");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ requesterName, requesterEmail, reason });
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Ruxsat so'rovi yuborish"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button form="access-request-form" type="submit">
            So&apos;rov yuborish
          </Button>
        </div>
      }
    >
      <form id="access-request-form" className="space-y-4" onSubmit={submit}>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-ink">{resourceTitle}</span> resursi uchun repository managerga ruxsat so&apos;rovi yuboriladi.
        </p>
        <div>
          <Label htmlFor="access-name">Foydalanuvchi</Label>
          <Input id="access-name" value={requesterName} onChange={(event) => setRequesterName(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="access-email">Email</Label>
          <Input id="access-email" type="email" value={requesterEmail} onChange={(event) => setRequesterEmail(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="access-reason">Asos</Label>
          <Textarea id="access-reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
