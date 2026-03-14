"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCompetitions } from "@/hooks/useCompetitions";
import Modal from "@/components/Modal";

interface Props {
  competitionId: string;
}

export default function DeleteCompetitionButton({ competitionId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { submitting, deleteCompetition } = useCompetitions();

  async function handleDelete() {
    const ok = await deleteCompetition(competitionId);
    if (ok) {
      router.push("/competitions");
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>Delete</Button>

      {open && (
        <Modal title="Delete Competition" onClose={() => setOpen(false)}>
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete this competition? This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={submitting} onClick={handleDelete}>
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
