"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteBookingAction } from "@/actions/bookings";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { useLocale } from "../providers/locale-provider";

export function DeleteBookingButton({ id }: { id: string }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteBookingAction(id);
      toast.success(dict.bookings.deleteSuccess);
      setOpen(false);
      router.push("/dashboard/bookings");
      router.refresh();
    });
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        {dict.bookings.deleteAction}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={dict.bookings.delete}
        confirmLabel={dict.common.confirm}
        onConfirm={handleDelete}
        loading={pending}
        variant="danger"
      >
        {dict.bookings.deleteConfirm}
      </Modal>
    </>
  );
}
