import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type DashboardStatItem = {
  id: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
};

type CardComponentsProps = {
  stats: DashboardStatItem[];
  className?: string;
  fullScreen?: boolean;
};

const CardComponents = ({
  stats,
  className,
  fullScreen = false,
}: CardComponentsProps) => {
  const half = Math.ceil(stats.length / 2);
  const row1 = stats.slice(0, half);
  const row2 = stats.slice(half);
  const columns = row1.map((item, i) => [item, row2[i]].filter(Boolean));

  const renderCard = (item: DashboardStatItem) => (
    <Card
      key={item.id}
      className={cn(
        "overflow-hidden rounded-xl border shadow-none border-border bg-card transition-all ",
        fullScreen ? "flex h-full min-h-0 p-2 sm:p-3 md:p-4" : "p-1",
      )}
    >
      <CardContent
        className={cn(
          "flex p-1",
          fullScreen
            ? "h-full min-h-0 w-full flex-1 flex-col items-center justify-between gap-1 p-0 text-center sm:justify-center sm:gap-2"
            : "items-center gap-3",
        )}
      >
        {/* Icon: shrinks when space is tight; text keeps priority */}
        <span
          className={cn(
            "flex items-center justify-center rounded-lg ",
            item.iconBg ?? "bg-muted",
            item.iconColor ?? "text-muted-foreground",
            fullScreen
              ? "h-8 w-8 shrink-0 sm:h-9 sm:w-9 md:h-10 md:w-10"
              : "h-7 w-7 shrink-0",
          )}
          style={
            fullScreen
              ? {
                  height: "clamp(1.25rem, 6vh, 2.5rem)",
                  width: "clamp(1.25rem, 6vh, 2.5rem)",
                  minHeight: "1.25rem",
                  minWidth: "1.25rem",
                }
              : undefined
          }
        >
          <item.icon
            className={fullScreen ? undefined : "h-3 w-3"}
            style={
              fullScreen
                ? {
                    height: "65%",
                    width: "65%",
                    minHeight: "0.75rem",
                    minWidth: "0.75rem",
                  }
                : undefined
            }
            strokeWidth={2}
          />
        </span>
        {/* Label + value: always visible, fixed readable size */}
        <div
          className={cn(
            "flex min-w-0 shrink-0 flex-col items-center justify-center overflow-hidden",
            fullScreen && "w-full min-h-11 justify-center gap-0",
          )}
        >
          <span
            className={cn(
              "font-medium text-muted-foreground truncate text-center leading-tight text-sm",
              fullScreen && "max-w-full",
            )}
          >
            {item.label}
          </span>
          <span
            className={cn(
              "font-bold tabular-nums tracking-tight text-foreground truncate text-center leading-tight text-sm",
              fullScreen && "max-w-full sm:text-base",
            )}
          >
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "grid h-full w-full grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:gap-3 sm:p-3 md:grid-cols-4 md:gap-4 md:p-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5 xl:gap-6 2xl:grid-cols-6",
          className,
        )}
        style={{
          gridAutoRows: "minmax(0, 1fr)",
        }}
      >
        {stats.map((item) => (
          <div key={item.id} className="min-h-0">
            {renderCard(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea
      className={cn("w-full whitespace-nowrap", className)}
      style={{ overflowY: "hidden" }}
    >
      <div className="mx-1 flex gap-2 pb-2 pt-1 sm:gap-4">
        {columns.map((pair, index) => (
          <div
            key={index}
            className="flex min-w-30 shrink-0 flex-col gap-2 sm:min-w-35 sm:gap-4"
          >
            {pair.map((item) => renderCard(item))}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CardComponents;
