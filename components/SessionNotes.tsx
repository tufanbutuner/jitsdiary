"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSessionNotes } from "@/app/sessions/[id]/actions";

interface Props {
  sessionId: string;
  initialNotes: string;
}

export default function SessionNotes({ sessionId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNotes(e.target.value);
    setSaved(false);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await updateSessionNotes(sessionId, notes);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        rows={4}
        value={notes}
        onChange={handleChange}
        placeholder="Add notes about this session…"
        className="resize-none"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending || saved}>
          {isPending ? "Saving…" : saved ? "Saved" : "Save Notes"}
        </Button>
        {saved && notes && (
          <span className="text-xs text-muted-foreground">Notes saved</span>
        )}
      </div>
    </form>
  );
}
