
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import dayjs from "@/lib/dayjs"
import { normalizeTimeZoneId } from "@/lib/app-timezone"
import { useTimezoneStore } from "@/store/client/timezone-store"

interface DatePickerWithRangeProps {
 date : DateRange | undefined;
 setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({ date, setDate }: DatePickerWithRangeProps) {
  const timeZoneId = useTimezoneStore((s) => s.timeZoneId)
  const tz = normalizeTimeZoneId(timeZoneId)

  return (
    <Field className=" w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="h-9 w-full justify-start text-sm font-normal"
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {dayjs(date.from).tz(tz).format("MMM D, YYYY")} -{" "}
                  {dayjs(date.to).tz(tz).format("MMM D, YYYY")}
                </>
              ) : (
                dayjs(date.from).tz(tz).format("MMM D, YYYY")
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
