"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTechniques, type Technique } from "@/hooks/useTechniques";

interface Props {
  sessionId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  guard: "Guard",
  mount: "Mount",
  takedown: "Takedown",
  submission: "Submission",
  escape: "Escape",
  transition: "Transition",
};

export default function LogTechniquesModal({ sessionId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [selected, setSelected] = useState<Technique[]>([]);

  const { library, logged, submitting, error, logTechniques, removeTechnique } =
    useTechniques(sessionId, open);

  const loggedIds = useMemo(() => new Set(logged.map((l) => l.technique_id)), [logged]);
  const selectedIds = useMemo(() => new Set(selected.map((t) => t.id)), [selected]);

  const available = useMemo(
    () => library.filter((t) => !loggedIds.has(t.id)),
    [library, loggedIds]
  );

  const grouped = useMemo(() => {
    const map: Record<string, Technique[]> = {};
    for (const t of available) {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    }
    return map;
  }, [available]);

  function toggleSelected(technique: Technique) {
    setSelected((prev) =>
      prev.some((t) => t.id === technique.id)
        ? prev.filter((t) => t.id !== technique.id)
        : [...prev, technique]
    );
  }

  async function handleRemove(st: Parameters<typeof removeTechnique>[0]) {
    await removeTechnique(st);
    router.refresh();
  }

  async function handleSave() {
    if (selected.length === 0) return;
    const ok = await logTechniques(selected.map((t) => t.id));
    if (ok) {
      setSelected([]);
      router.refresh();
    }
  }

  function handleClose() {
    setOpen(false);
    setSelected([]);
    setComboOpen(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Log Techniques</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg shadow-xl flex flex-col max-h-[85vh]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Log Techniques</CardTitle>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
                type="button"
              >
                ×
              </button>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {logged.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Already logged</p>
                  <div className="flex flex-wrap gap-2">
                    {logged.map((st) => (
                      <span
                        key={st.id}
                        className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {st.expand?.technique_id?.name ?? st.technique_id}
                        <button onClick={() => handleRemove(st)} className="ml-1 text-zinc-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Popover open={comboOpen} onOpenChange={setComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboOpen}
                    className="w-full justify-between mb-3"
                  >
                    {selected.length > 0
                      ? `${selected.length} technique${selected.length > 1 ? "s" : ""} selected`
                      : "Select techniques..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandInput placeholder="Search techniques..." />
                    <CommandList className="max-h-64">
                      <CommandEmpty>No techniques found.</CommandEmpty>
                      {Object.entries(grouped).map(([category, techniques]) => (
                        <CommandGroup key={category} heading={CATEGORY_LABELS[category] ?? category}>
                          {techniques.map((t) => (
                            <CommandItem
                              key={t.id}
                              value={`${t.id} ${t.name} ${t.category}`}
                              onSelect={() => toggleSelected(t)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedIds.has(t.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {t.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selected.map((t) => (
                    <span
                      key={t.id}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {t.name}
                      <button
                        type="button"
                        onClick={() => toggleSelected(t)}
                        className="ml-1 text-blue-400 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-muted-foreground">
                  {selected.length > 0 ? `${selected.length} selected` : ""}
                </span>
                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={handleClose}>Close</Button>
                  <Button onClick={handleSave} disabled={submitting || selected.length === 0}>
                    {submitting ? "Saving..." : "Add Selected"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
