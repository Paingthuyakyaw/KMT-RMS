import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownUp, Columns3, Download, Plus, Upload } from "lucide-react";
import InventoryCard from "./components/card";
import { useState, useMemo } from "react";
import InventoryTable from "./components/table";
import {
  DEFAULT_INVENTORY_COLUMNS,
  DEFAULT_COLUMN_ORDER,
} from "./data/columns";
import {
  SortColumnsModal,
  type SortableColumnItem,
} from "./components/sort-columns-modal";

type InventorySection = {
  id: string;
  title: string;
  items: { label: string; count: number }[];
  footer?: string;
};

const sections: InventorySection[] = [
  {
    id: "site-regions",
    title: "Site Regions",
    items: [
      { label: "Northeast", count: 1 },
      { label: "West Coast", count: 1 },
      { label: "Midwest", count: 1 },
      { label: "South Central", count: 1 },
      { label: "Southwest", count: 1 },
    ],
    footer: "Total Sites: 10",
  },
  {
    id: "dg-brands",
    title: "DG Brands",
    items: [
      { label: "Cummins", count: 1 },
      { label: "Caterpillar", count: 1 },
      { label: "Kohler", count: 1 },
      { label: "Generac", count: 1 },
      { label: "John Deere", count: 1 },
    ],
  },
  {
    id: "dg-controller-brands",
    title: "DG Controller Brands",
    items: [
      { label: "Deep Sea Electronics", count: 3 },
      { label: "ComAp", count: 3 },
      { label: "Woodward", count: 2 },
      { label: "DEIF", count: 2 },
    ],
  },
  {
    id: "dg-controller-models",
    title: "DG Controller Models",
    items: [
      { label: "DSE-7320", count: 1 },
      { label: "InteliGen NT", count: 1 },
      { label: "DSE-8610", count: 1 },
      { label: "easYgen-3500", count: 1 },
      { label: "AGC-4", count: 1 },
    ],
  },
  {
    id: "battery-models",
    title: "Battery Models",
    items: [
      { label: "LFP-500", count: 1 },
      { label: "NCM-350", count: 1 },
      { label: "LFP-420", count: 1 },
      { label: "NCM-600", count: 1 },
      { label: "LFP-280", count: 1 },
    ],
  },
  {
    id: "rms-brands",
    title: "RMS Brands",
    items: [
      { label: "Schneider Electric", count: 2 },
      { label: "Siemens", count: 1 },
      { label: "ABB", count: 1 },
      { label: "Honeywell", count: 1 },
      { label: "GE Digital", count: 1 },
    ],
  },
  {
    id: "power-core-brands",
    title: "Power Core Brands",
    items: [
      { label: "Tesla PowerCore Pro", count: 1 },
      { label: "LG Energy Solution", count: 1 },
      { label: "BYD Battery-Box Pro", count: 1 },
      { label: "Panasonic Energy", count: 1 },
      { label: "Samsung SDI", count: 1 },
    ],
  },
];

type InventoryManagementProps = {
  className?: string;
};

export const InventoryManagement = ({
  className,
}: InventoryManagementProps) => {
  const [columnNameMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("inventory-column-name-map");
    return saved ? JSON.parse(saved) : {};
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem("inventory-column-order");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        const valid = DEFAULT_COLUMN_ORDER.filter((id) => parsed.includes(id));
        const missing = DEFAULT_COLUMN_ORDER.filter(
          (id) => !parsed.includes(id),
        );
        return valid.length ? [...valid, ...missing] : DEFAULT_COLUMN_ORDER;
      } catch {
        return DEFAULT_COLUMN_ORDER;
      }
    }
    return DEFAULT_COLUMN_ORDER;
  });

  const [sortColumnsOpen, setSortColumnsOpen] = useState(false);

  const orderedColumnsForModal = useMemo((): SortableColumnItem[] => {
    const byId = new Map(
      DEFAULT_INVENTORY_COLUMNS.map((c) => [
        c.id,
        {
          id: c.id,
          label: columnNameMap[c.id] || c.defaultLabel,
          isDefault: c.isDefault,
        },
      ]),
    );
    const valid = columnOrder.filter((id) => byId.has(id));
    const missing = DEFAULT_COLUMN_ORDER.filter((id) => !valid.includes(id));
    const finalOrder = valid.length
      ? [...valid, ...missing]
      : DEFAULT_COLUMN_ORDER;
    return finalOrder.map((id) => byId.get(id)!);
  }, [columnOrder, columnNameMap]);

  const defaultColumnsForModal = useMemo((): SortableColumnItem[] => {
    return DEFAULT_INVENTORY_COLUMNS.map((c) => ({
      id: c.id,
      label: columnNameMap[c.id] || c.defaultLabel,
      isDefault: c.isDefault,
    }));
  }, [columnNameMap]);

  const handleApplyColumnOrder = (orderedIds: string[]) => {
    console.log(orderedIds, "orderIds");

    setColumnOrder(orderedIds);
    localStorage.setItem("inventory-column-order", JSON.stringify(orderedIds));
    // Later: optional API call to persist on backend
  };

  const handleResetColumnOrder = () => {
    setColumnOrder(DEFAULT_COLUMN_ORDER);
    localStorage.setItem(
      "inventory-column-order",
      JSON.stringify(DEFAULT_COLUMN_ORDER),
    );
  };

  return (
    <section className={cn("space-y-4", className)}>
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Inventory Management
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage and track all equipment and power systems.
          </p>
        </div>

        {/* action buttons (no Super Adm) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => setSortColumnsOpen(true)}
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            Sort Columns
          </Button>
          <Button  variant="outline" className="gap-1">
            <Columns3 className="h-3.5 w-3.5" />
            Manage Columns
          </Button>
          <Button  variant="outline" className="gap-1">
            <Upload className="h-3.5 w-3.5" />
            Import Data
          </Button>
          <Button  variant="outline" className="gap-1">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button  className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add New Site
          </Button>
        </div>
      </div>

      {/* cards grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <InventoryCard key={section.id} section={section} />
        ))}
      </div>

      {/* table */}
      <InventoryTable columnNameMap={columnNameMap} columnOrder={columnOrder} />

      <SortColumnsModal
        open={sortColumnsOpen}
        onOpenChange={setSortColumnsOpen}
        columns={orderedColumnsForModal}
        defaultColumns={defaultColumnsForModal}
        onApply={handleApplyColumnOrder}
        onReset={handleResetColumnOrder}
      />
    </section>
  );
};
