import { Card, CardContent } from "@/components/ui/card";

const InventoryCard = ({ section }: { section: any }) => {
  return (
    <Card
      key={section.id}
      className="border border-border/60 bg-card shadow-none transition-colors"
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-foreground">
          {section.title}
        </h3>

        <div className="space-y-1.5">
          {section.items.map((item: any) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-muted-foreground"
            >
              <span>{item.label}</span>
              <span className="text-[11px] font-semibold text-sky-500">
                {item.count}
              </span>
            </div>
          ))}
        </div>

        {section.footer && (
          <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">
            {section.footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryCard;
