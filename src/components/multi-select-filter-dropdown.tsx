import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

export type MultiSelectOption = {
  label: string;
  value: string;
};

type MultiSelectFilterDropdownProps = {
  label: string;
  placeholder: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
};

export const MultiSelectFilterDropdown = ({
  label,
  placeholder,
  options,
  values,
  onChange,
}: MultiSelectFilterDropdownProps) => {
  const selectedLabel =
    values.length === 0 ? placeholder : `${values.length} selected`;

  const handleToggleOption = (optionValue: string, checked: boolean | string) => {
    if (checked) {
      if (!values.includes(optionValue)) {
        onChange([...values, optionValue]);
      }
    } else {
      onChange(values.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="space-y-1">
      <Label className=" font-medium text-muted-foreground">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-between px-2 "
          >
            <span className="truncate font-normal ">{selectedLabel}</span>
            <ChevronDown className="ml-2 h-3 w-3 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {options.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${label}-${option.value}`}
                  checked={values.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleToggleOption(option.value, checked)
                  }
                />
                <label
                  htmlFor={`${label}-${option.value}`}
                  className="cursor-pointer "
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

