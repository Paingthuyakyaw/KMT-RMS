import * as React from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  buildTimeZoneOptions,
  type TimeZoneOption,
} from "@/lib/timezone-options";
import { useTimezoneStore } from "@/store/client/timezone-store";

const OPTIONS = buildTimeZoneOptions();

function resolveSelection(timeZoneId: string): TimeZoneOption | null {
  return (
    OPTIONS.find((o) => o.id === timeZoneId) ??
    OPTIONS.find((o) => o.id === "GMT") ??
    OPTIONS[0] ??
    null
  );
}

export function TimezoneSearchCombobox() {
  const timeZoneId = useTimezoneStore((s) => s.timeZoneId);
  const setTimeZoneId = useTimezoneStore((s) => s.setTimeZoneId);
  const selected = React.useMemo(
    () => resolveSelection(timeZoneId),
    [timeZoneId],
  );
  const [inputValue, setInputValue] = React.useState(() =>
    selected ? selected.displayLine : "",
  );

  React.useEffect(() => {
    if (selected) setInputValue(selected.displayLine);
  }, [selected]);

  return (
    <Combobox
      items={OPTIONS}
      value={selected}
      itemToStringLabel={(o: TimeZoneOption) =>
        `${o.displayLine} ${o.label} ${o.id} ${o.offsetLabel}`
      }
      itemToStringValue={(o: TimeZoneOption) => o.id}
      isItemEqualToValue={(a, b) => a.id === b.id}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      onValueChange={(o: TimeZoneOption | null) => {
        const fallback = resolveSelection("GMT")!;
        if (o == null) {
          setTimeZoneId("GMT");
          setInputValue(fallback.displayLine);
          return;
        }
        setTimeZoneId(o.id);
        setInputValue(o.displayLine);
      }}
    >
      <ComboboxInput
        placeholder="Select timezone"
        showClear
        className="h-8 max-w-[min(340px,calc(100vw-9rem))] min-w-[180px] text-xs"
        aria-label="App timezone"
      />
      <ComboboxContent className="w-max max-w-[min(520px,92vw)] min-w-[var(--anchor-width)]">
        <ComboboxEmpty>No timezone found.</ComboboxEmpty>
        <ComboboxList>
          {(opt: TimeZoneOption) => (
            <ComboboxItem key={opt.id} value={opt} className="items-start">
              <span className="whitespace-normal break-words pr-6 text-left">
                {opt.displayLine}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
