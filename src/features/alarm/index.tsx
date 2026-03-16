import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fakeAlarm = [
  {
    name: "MDY100",
    triiger: "a",
    site_type: "DY",
    time: "2026-03-15 13:58:3",
    state: "Alarm",
    type: "Online",
    duration: 0.04,
  },
  {
    name: "MDY200",
    triiger: "b",
    site_type: "YD",
    time: "2026-03-15 13:58:3",
    state: "Alarm",
    type: "Offline",
    duration: 0.06,
  },
];

const ActiveAlarm = () => {
  return (
    <div className=" h-screen">
      <h4 className="text-sm font-semibold">Active Alarm</h4>
      <div className=" my-5">
        <Select  >
          <SelectTrigger className=" w-50  bg-white " >
            <SelectValue className=" " placeholder="Select Trigger" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="a">a</SelectItem>
            <SelectItem value="b">b</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className=" bg-white border rounded-md text-sm   ">
        <div className=" border-b grid grid-cols-8 gap-2 last:border-b-0">
          <div className=" border-r pl-2 py-2">Device Name</div>
          <div className="border-r py-2">Trigger Name</div>
          <div className="border-r py-2">Site Type</div>
          <div className="border-r py-2 col-span-2">Alarm Generate Time</div>
          <div className="border-r py-2">Alarm State</div>
          <div className="border-r py-2">Alarm Type</div>
          <div className=" text-end pr-2 py-2">Duration</div>
        </div>
        {fakeAlarm.map((item, idx) => (
          <div
            key={idx}
            className=" border-b grid grid-cols-8 gap-2 last:border-b-0"
          >
            <div className=" border-r pl-2 py-2">{item.name}</div>
            <div className="border-r py-2">{item.triiger}</div>
            <div className="border-r py-2">{item.site_type}</div>
            <div className="border-r py-2 col-span-2">{item.time}</div>
            <div className="border-r py-2">
              <Badge>{item.state}</Badge>
            </div>
            <div className="border-r py-2">
              <Badge
                className={
                  item.type == "Online" ? "bg-green-600" : "bg-red-600"
                }
              >
                {item.type}
              </Badge>
            </div>
            <div className=" text-end pr-2 py-2">{item.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveAlarm;
