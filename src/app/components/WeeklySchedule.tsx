"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Timeslot from "./Timeslot";
import { Button } from "@/components/ui/button";

interface SelectedSlot {
  day: string;
  time: string;
  volunteer: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "8:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
];

const WeeklySchedule = () => {
    
    const [year, setYear] = useState<number>(0);
    const [month, setMonth] = useState<number>(0);
    const [date, setDate] = useState<number>(0);
    const [day, setDay] = useState<number>(0);

    useEffect(() => {
        const today: Date = new Date();
        setYear(today.getFullYear());
        setMonth(today.getMonth() + 1); 
        setDate(today.getDate());
        setDay(today.getDay());
    }, [])

  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [volunteerName, setVolunteerName] = useState("");
  const [vFirstName, setVFirstName] = useState("");
  const [vLastName, setVLastName] = useState("");
  const [isExistingVolunteer, setIsExistingVolunteer] = useState<boolean>(false);

  const handleFindVolunteer = async () => {
    setVolunteerName(vFirstName + " " + vLastName);
    const retrieveVolunteer = async () => {
      try {
        const first = encodeURIComponent(vFirstName.toLowerCase());
        const last = encodeURIComponent(vLastName.toLowerCase());
        const res = await fetch(`/api/get-volunteer?first=${first}&last=${last}`);
        if (!res.ok) {
          console.error('Failed to fetch volunteer:', res.status, res.statusText);
          setIsExistingVolunteer(false);
          return;
        }
        const data = await res.json();
        // data is an array of volunteers — existing if length > 0
        setIsExistingVolunteer(Array.isArray(data) && data.length > 0);
      } catch (err) {
        console.error('Error fetching volunteer:', err);
        setIsExistingVolunteer(false);
      }
    }
    await retrieveVolunteer();
  }

  const handleChangeFirstName = (input: string) => {
    setVolunteerName("")
    setVFirstName(input)
  }

  const handleChangeLastName = (input: string) => {
    setVolunteerName("")
    setVLastName(input)
  }

  const obtainDateArr = (day: number, date: number, month: number): string[] => {
    const getDiffDate = (diff: number) => {
      const base = new Date(year, month - 1, date);
      base.setDate(base.getDate() + diff);
      const dd = base.getDate().toString().padStart(2, "0");
      const mm = (base.getMonth() + 1).toString().padStart(2, "0");
      return `${dd}/${mm}`;
    };

    const arr = [0, 1, 2, 3, 4, 5, 6];
    return arr.map(num => getDiffDate(num - day));
  };

  const handleSlotClick = (day: string, time: string) => {
    if (!volunteerName.trim()) {
      return;
    }

    const slotKey = `${day}-${time}`;
    const existingSlot = selectedSlots.find(
      (slot) => slot.day === day && slot.time === time && slot.volunteer === volunteerName
    );

    if (existingSlot) {
      setSelectedSlots(selectedSlots.filter((slot) => !(slot.day === day && slot.time === time && slot.volunteer === volunteerName)));
    } else {
      setSelectedSlots([...selectedSlots, { day, time, volunteer: volunteerName }]);
    }
  };

  const isSlotSelected = (day: string, time: string) => {
    return selectedSlots.some(
      (slot) => slot.day === day && slot.time === time && slot.volunteer === volunteerName
    );
  };

  const getVolunteersForSlot = (day: string, time: string) => {
    return selectedSlots
      .filter((slot) => slot.day === day && slot.time === time)
      .map((slot) => slot.volunteer);
  };

  const totalHours = selectedSlots.filter((slot) => slot.volunteer === volunteerName).length * 2;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Volunteer Schedule</h1>
            <p className="text-sm text-muted-foreground">Click on time slots to add your availability</p>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex max-w-sm gap-2">
                <input
                  id="volunteer-first-name"
                  type="text"
                  placeholder="Enter first name"
                  value={vFirstName}
                  onChange={(e) => handleChangeFirstName(e.target.value)}
                  className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <input
                  id="volunteer-last-name"
                  type="text"
                  placeholder="Enter last name"
                  value={vLastName}
                  onChange={(e) => handleChangeLastName(e.target.value)}
                  className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
              {vFirstName && vLastName &&(
                <Button onClick={handleFindVolunteer}>Confirm Volunteer</Button>
              )}
            </div>
            <div className="flex gap-2">
              {vFirstName && vLastName && volunteerName && (
                <Badge variant="secondary" className="text-sm">
                  {totalHours} hours selected
                </Badge>
              )}
              {vFirstName && vLastName && volunteerName && (
                isExistingVolunteer 
                ? <div className="inline-block px-3 py-1 text-sm font-semibold text-green-100 bg-green-700 border border-green-800 rounded-full shadow-sm">
                    Registered
                  </div> 
                : <div className="cursor-pointer inline-block px-3 py-1 text-sm font-semibold text-red-100 bg-red-700 border border-red-800 rounded-full shadow-sm">
                    Not Registered
                  </div> 
              )}
            </div>
          </div>
        </Card>

        <div className="bg-white">
          <div className="overflow-x-auto h-full">
            <div className="min-w-[900px]">
              {/* Header with days */}
              <div className="grid grid-cols-8 border-b bg-muted/30">
                <div className="border-r border-slot-border"></div>
                {DAYS.map((d, id) => (
                  <div key={d} className="p-3 text-center border-r border-slot-border last:border-r-0">
                    <div className="text-xs font-medium text-muted-foreground uppercase">{d.slice(0, 3)}</div>
                    <div className="text-sm font-semibold text-foreground">{obtainDateArr(day, date!, month!)[id]}</div>
                  </div>
                ))}
              </div>

              {/* Time slots grid */}
              <div className="grid grid-cols-8">
                {TIME_SLOTS.map((time) => (
                  <>
                    <div key={`time-${time}`} className="px-2 py-0.5 text-right border-r border-b border-slot-border bg-muted/10">
                      <span className="text-xs font-medium text-time-label">{time.split(" - ")[0]}</span>
                    </div>
                    {DAYS.map((d, id) => (
                      <Timeslot
                        current_day={day}
                        key={id}
                        day={d}
                        time={time}
                        isSelected={isSlotSelected(d, time)}
                        volunteers={getVolunteersForSlot(d, time)}
                        disabled={!volunteerName.trim()}
                        onClick={() => handleSlotClick(d, time)}
                      />
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
        {selectedSlots.length > 0 && (
            <Button
            variant="outline"
            className="cursor-pointer">
                Update Timesheet
            </Button>
        )

        }

        {!volunteerName && (
        <div className='w-full flex items-center justify-center'>
            <Badge className="text-center py-1 px-3" variant='outline'>
            <p className="text-sm text-muted-foreground">
            Enter your name above to start selecting time slots
            </p>
        </Badge>
        </div>
        )}
      </div>
    </div>
  );
};

export default WeeklySchedule;