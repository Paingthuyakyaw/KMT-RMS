
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {  format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

interface DatePickerWithRangeProps {
 date : DateRange | undefined;
 setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({ date, setDate }: DatePickerWithRangeProps) {

  return (
    <Field className=" w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="justify-start  font-normal"
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
