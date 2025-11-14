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
  const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);

  const handleFindVolunteer = async () => {
    setIsLoadingReg(true);
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
    setIsLoadingReg(false);
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
                isLoadingReg 
                ? <div role="status">
                    <svg aria-hidden="true" className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
                : isExistingVolunteer 
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