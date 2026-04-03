import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import dayjs from "@/lib/dayjs"
import { normalizeTimeZoneId } from "@/lib/app-timezone"
import { useTimezoneStore } from "@/store/client/timezone-store"

interface dateProps{
    date: Date | undefined
    setDate: (date : Date | undefined) => void
}

export function DatePicker({date , setDate} : dateProps) {
  const timeZoneId = useTimezoneStore((s) => s.timeZoneId)
  const tz = normalizeTimeZoneId(timeZoneId)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          {date ? dayjs(date).tz(tz).format("MMM D, YYYY") : <span>Pick a date</span>}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  )
}
