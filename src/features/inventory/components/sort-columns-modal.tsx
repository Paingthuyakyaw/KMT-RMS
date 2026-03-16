"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ArrowDownUp, GripVertical, Lightbulb } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";

export type SortableColumnItem = {
  id: string;
  label: string;
  isDefault?: boolean;
};

type SortColumnsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Columns in current display order (for initial list when modal opens) */
  columns: SortableColumnItem[];
  /** Columns in default order (for Reset Order button) */
  defaultColumns: SortableColumnItem[];
  onApply: (orderedIds: string[]) => void;
  onReset: () => void;
};

export function SortColumnsModal({
  open,
  onOpenChange,
  columns,
  defaultColumns,
  onApply,
  onReset,
}: SortColumnsModalProps) {
  const [list, setList] = useState<SortableColumnItem[]>(columns);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) setList(columns);
  }, [open, columns]);

  const resetList = useCallback(() => {
    setList(defaultColumns);
    onReset();
  }, [defaultColumns, onReset]);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, index: number) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      e.dataTransfer.setData("application/json", JSON.stringify(list[index]));
      setDraggedIndex(index);
    },
    [list],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTargetIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      const fromIndex = draggedIndex;
      setDraggedIndex(null);
      setDropTargetIndex(null);
      if (fromIndex == null || fromIndex === dropIndex) return;
      const next = [...list];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(dropIndex, 0, removed);
      setList(next);
    },
    [list, draggedIndex],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }, []);

  const handleKeyDown = useCallback(
    (_e: KeyboardEvent<HTMLDivElement>, _index: number) => {
      // Optional: ArrowUp/ArrowDown could move item; drag is primary
    },
    [],
  );

  const handleApply = useCallback(() => {
    onApply(list.map((c) => c.id));
    onOpenChange(false);
  }, [list, onApply, onOpenChange]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sort-columns-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background shadow-none"
      >
        <div className="flex flex-col max-h-[85vh]">
          <div className="shrink-0 border-b px-4 py-3">
            <h2 id="sort-columns-title" className="text-base font-semibold">
              Sort Columns
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag and drop columns to reorder them. The new order will be applied to the table.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-between border-b px-4 py-2">
            <span className="text-xs text-muted-foreground">
              Total Columns: {list.length}
            </span>
            <Button variant="ghost" size="sm" className="text-xs" onClick={resetList}>
              Reset Order
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="h-[min(50vh,400px)] w-full">
              <div className="space-y-1 p-4">
                {list.map((col, index) => (
                <div
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm transition-colors",
                    draggedIndex === index && "opacity-60",
                    dropTargetIndex === index && "ring-2 ring-primary/50",
                  )}
                  tabIndex={0}
                  role="button"
                  aria-label={`${col.label}, position ${index + 1}. Drag to reorder.`}
                >
                  <span
                    className="text-muted-foreground cursor-grab active:cursor-grabbing [&_svg]:size-4"
                    aria-hidden
                  >
                    <GripVertical />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{col.label}</div>
                    <div className="text-xs text-muted-foreground">
                      Default Column
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    #{index + 1}
                  </span>
                </div>
              ))}
              </div>
            </ScrollArea>
          </div>

          <div className="shrink-0 flex items-center gap-2 border-t bg-muted/30 px-4 py-2">
            <Lightbulb className="size-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Click and drag the grip icon to reorder columns. Blue-highlighted items are custom columns.
            </p>
          </div>

          <div className="shrink-0 flex justify-end gap-2 border-t px-4 py-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="gap-1.5" onClick={handleApply}>
              <ArrowDownUp className="size-3.5" />
              Apply New Order
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
