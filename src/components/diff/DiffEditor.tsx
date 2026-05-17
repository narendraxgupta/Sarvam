import { Pencil } from "lucide-react";
import { useState } from "react";
import { useDiffStore } from "@/store/diffStore";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";

export function DiffEditor() {
  const [open, setOpen] = useState(false);
  const outputA = useDiffStore((s) => s.outputA);
  const outputB = useDiffStore((s) => s.outputB);
  const setOutputA = useDiffStore((s) => s.setOutputA);
  const setOutputB = useDiffStore((s) => s.setOutputB);

  const [a, setA] = useState(outputA);
  const [b, setB] = useState(outputB);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setA(outputA);
          setB(outputB);
          setOpen(true);
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="text-xs">Edit inputs</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl w-[88vw]">
          <DialogTitle>Edit comparison inputs</DialogTitle>
          <DialogDescription>
            Paste new outputs from Model A and Model B. The diff
            recomputes instantly.
          </DialogDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="min-w-0">
              <div className="text-2xs uppercase tracking-tightish text-warn font-semibold mb-1.5">
                Model A
              </div>
              <textarea
                value={a}
                onChange={(e) => setA(e.target.value)}
                spellCheck={false}
                className="w-full h-72 rounded-md border border-line bg-bg-elevated p-3 font-mono text-xs text-ink leading-relaxed outline-none focus-visible:border-accent resize-y"
                aria-label="Model A output"
              />
            </div>
            <div className="min-w-0">
              <div className="text-2xs uppercase tracking-tightish text-accent font-semibold mb-1.5">
                Model B
              </div>
              <textarea
                value={b}
                onChange={(e) => setB(e.target.value)}
                spellCheck={false}
                className="w-full h-72 rounded-md border border-line bg-bg-elevated p-3 font-mono text-xs text-ink leading-relaxed outline-none focus-visible:border-accent resize-y"
                aria-label="Model B output"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setOutputA(a);
                setOutputB(b);
                setOpen(false);
              }}
            >
              Recompute diff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
