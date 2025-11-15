"use client";
import { act, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Timeslot from "./Timeslot";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, LogIn, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SelectedSlot {
  date: Date;
  timeslot: string;
  v_id: number;
  v_name: string;
  role: string;
}

interface VolunteerCard {
  v_name: string,
  isOpen: boolean,
  role: string,
}

interface Volunteer {
  id: number,
  first_name: string,
  last_name: string,
  role: string,
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

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const WeeklySchedule = () => {
    
  const [year, setYear] = useState<number>(0);
  const [month, setMonth] = useState<number>(0);
  const [date, setDate] = useState<number>(0);
  const [day, setDay] = useState<number>(0);

  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [newSelectedSlots, setNewSelectedSlots] = useState<SelectedSlot[]>([]);
  const [volunteerName, setVolunteerName] = useState("");
  const [vFirstName, setVFirstName] = useState("");
  const [vLastName, setVLastName] = useState("");
  const [vRole, setVRole] = useState("");
  const [isExistingVolunteer, setIsExistingVolunteer] = useState<boolean>(false);
  const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);
  const [vId, setVId] = useState<number>(0);
  const [activeVolunteers, setActiveVolunteers] = useState<Array<VolunteerCard>>([]);
  const [allRegisteredVolunteers, setAllRegisteredVolunteers] = useState<Volunteer[]>([]);

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [weekOffset, setWeekOffset] = useState(0);

  const fetchTimeslots = async () => {
    const res = await fetch("/api/get-timeslots");
    const data = await res.json();

    // 1. Convert ("YYYY-MM-DD" → Date)
    const formattedSlots = data.map(
      (item: {
        v_id: number;
        date: string;
        timeslot: string;
        v_name: string;
        role: string;
      }) => ({
        ...item,
        date: new Date(item.date),
      })
    );

    // 2. selectedSlots should contain ALL slots
    setSelectedSlots(formattedSlots as SelectedSlot[]);
  };

  const fetchAllVolunteers = async () => {
    const res = await fetch("/api/get-all-volunteers");
    const data = await res.json();
    setAllRegisteredVolunteers(data as Volunteer[]);
  }

  const getActiveVolunteersForWeek = (slots: SelectedSlot[], offset: number) => {
    const year = new Date().getFullYear();

    // 1. Compute valid dates for the week
    const validDates = new Set(
      getWeekDateRange(offset).dateArr.map((d) => {
        const [dd, mm] = d.split("/");
        return `${year}-${mm}-${dd}`;
      })
    );

    // 2. Filter slots for this week
    const filteredForWeek = slots.filter((slot) => {
      const slotDateStr = slot.date.toISOString().split("T")[0]; // "YYYY-MM-DD"
      return validDates.has(slotDateStr);
    });

    // 3. Map to activeVolunteers
    const vCardArr = Array.from(
      new Set(
        filteredForWeek.map((v) => `${v.v_name}|${v.role}`)
      )
    ).map((key) => {
      const [v_name, role] = key.split("|");
      return { v_name, role, isOpen: false };
    });

    return vCardArr;
  };

  useEffect(() => {
    const vCards = getActiveVolunteersForWeek(selectedSlots, weekOffset);
    setActiveVolunteers(vCards);
  }, [selectedSlots, weekOffset]);

  useEffect(() => {
    const today: Date = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1); 
    setDate(today.getDate());
    setDay(today.getDay());
    fetchTimeslots();
    fetchAllVolunteers();
  }, [])

  const retrieveVolunteer = async (vFirstName: string, vLastName: string) => {
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
        setVId(data[0].id);
        setVRole(data[0].role);
        toast.success(`Selecting slots now for ${capitalize(vFirstName) + " " + capitalize(vLastName)}!`);
      } catch (err) {
        console.error('Error fetching volunteer:', err);
        setIsExistingVolunteer(false);
        toast.error(`${capitalize(vFirstName) + " " + capitalize(vLastName)} is not in the system! Click on the 'Not Registered' badge to register them immediately!`);
      }
    }

  const handleFindVolunteer = async () => {
    setIsLoadingReg(true);
    setVolunteerName(capitalize(vFirstName) + " " + capitalize(vLastName));
    await retrieveVolunteer(vFirstName, vLastName);
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

  const handleRegisterVolunteer = async () => {
    setIsLoadingReg(true);
    try {
      const res = await fetch("/api/register-volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: vFirstName.toLowerCase(),
          last_name: vLastName.toLowerCase(),
          role: 'volunteer',
        }),
      });
      if (!res.ok) {
        console.error('Failed to register volunteer:', res.status, res.statusText);
        setIsExistingVolunteer(false);
        return;
      }
      setIsExistingVolunteer(true);
    } catch (err) {
      console.error('Error registering volunteer:', err);
      setIsExistingVolunteer(false);
    } finally {
      setIsLoadingReg(false)
      handleFindVolunteer()
    }
  }

  const deleteTimeslot = async (vid: number, date: Date, time: string) => {
    try {
      const res = await fetch("/api/delete-timeslot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          v_id: vid,
          date: date,
          timeslot: time,
        }),
      });
      if (!res.ok) {
        console.error('Failed to delete timeslot:', res.status, res.statusText);
      }
      setSelectedSlots(selectedSlots.filter((slot) => !(slot.date.toDateString() === date.toDateString() && slot.timeslot === time && slot.v_id === vId && slot.v_name.toLowerCase() === volunteerName.toLowerCase())));
    } catch (err) {
      console.error('Error deleting timeslot:', err);
    }
  }

  const handleSlotClick = (index: number, time: string) => {
    if (!volunteerName.trim()) {
      return;
    }

    // 1. Compute the Sunday of the current week (weekOffset-aware)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

    // 2. Compute the slot's actual date for the clicked index
    const slotDate = new Date(startOfWeek);
    slotDate.setDate(startOfWeek.getDate() + index); // 0–6

    // 3. Check if user already added this slot in new selections
    const existingNewSelectedSlot = newSelectedSlots.find(
      (slot) =>
        slot.date.toDateString() === slotDate.toDateString() &&
        slot.timeslot === time &&
        slot.v_id === vId &&
        slot.v_name.toLowerCase() === volunteerName.toLowerCase()
    );

    // 4. Check if slot exists in database (registered slots)
    const existingRegisteredSlot = selectedSlots.find(
      (slot) =>
        slot.date.toDateString() === slotDate.toDateString() &&
        slot.timeslot === time &&
        slot.v_id === vId &&
        slot.v_name.toLowerCase() === volunteerName.toLowerCase()
    );

    // 5. If user already added it → remove from newSelectedSlots
    if (existingNewSelectedSlot) {
      setNewSelectedSlots(
        newSelectedSlots.filter(
          (slot) =>
            !(
              slot.date.toDateString() === slotDate.toDateString() &&
              slot.timeslot === time &&
              slot.v_id === vId &&
              slot.v_name.toLowerCase() === volunteerName.toLowerCase()
            )
        )
      );
    }
    // 6. If it exists in DB → permanently delete
    else if (existingRegisteredSlot) {
      deleteTimeslot(vId, slotDate, time);
      toast.success("Time slot has been permanently deleted!");
    }
    // 7. Otherwise → add new timeslot (pending)
    else {
      setNewSelectedSlots([
        ...newSelectedSlots,
        {
          date: slotDate,
          timeslot: time,
          v_id: vId,
          v_name: volunteerName,
          role: vRole,
        },
      ]);
    }
  };

  const isSlotRegistered = (index: number, timeslot: string) => {
    const base = new Date(year, month - 1, date);
    base.setDate(base.getDate() + index - day);
    const dd = base.getDate();
    const slotDate = new Date(year, month - 1, dd);
    return selectedSlots.some(
      (slot) => slot.date.toDateString() === slotDate.toDateString() && slot.timeslot === timeslot
    );
  };

  const isSlotSelected = (index: number, timeslot: string) => {
    const base = new Date(year, month - 1, date);
    base.setDate(base.getDate() + index - day);
    const dd = base.getDate();
    const slotDate = new Date(year, month - 1, dd);
    return selectedSlots.some(
      (slot) => slot.date.toDateString() === slotDate.toDateString() && slot.timeslot === timeslot && slot.v_id === vId && slot.v_name.toLowerCase() === volunteerName.toLowerCase()
    );
  };

  function formatDateLocal(date: Date) {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, "0"); // Month 0-indexed
    const dd = date.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const getVolunteersForSlot = (index: number, timeslot: string) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

    const slotDate = new Date(startOfWeek);
    slotDate.setDate(startOfWeek.getDate() + index);

    const slotKey = formatDateLocal(slotDate);

    const allSlots = [...selectedSlots, ...newSelectedSlots];

    return Array.from(
      new Set(
        allSlots
          .filter(slot => slot.timeslot === timeslot && formatDateLocal(slot.date) === slotKey)
          .map(slot => slot.v_name)
      )
    )
  };


  const getVolunteerStats = (name: string) => {
    const { dateArr } = getWeekDateRange(weekOffset); // current week
    const year = new Date().getFullYear();

    // Convert "DD/MM" → "YYYY-MM-DD" for comparison
    const weekDates = new Set(
      dateArr.map(d => {
        const [dd, mm] = d.split("/");
        return `${year}-${mm}-${dd}`;
      })
    );

    const shiftsThisWeek = selectedSlots.filter(
      slot =>
        slot.v_name.toLowerCase() === name.toLowerCase() &&
        weekDates.has(formatDateLocal(slot.date))
    );

    return {
      hours: shiftsThisWeek.length * 2, // assuming each shift = 2 hours
      shifts: shiftsThisWeek.length
    };
  };

  const toggleVolunteerCard = (name: string) => {
    setActiveVolunteers(activeVolunteers.map(v => 
      v.v_name === name ? { ...v, isOpen: !v.isOpen } : v
    ));
  };

  const handleRegisterTimeslots = () => {
    const registerTimeslot = async (vid: number, date: Date, time: string) => {
      try {
        const res = await fetch("/api/register-timeslot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            v_id: vid,
            date: date,
            timeslot: time,
          }),
        });
        if (!res.ok) {
          console.error('Failed to register timeslot:', res.status, res.statusText);
        }
      } catch (err) {
        console.error('Error registering timeslot:', err);
      }
    }
    const registerAllSlots = async () => {
      await Promise.all(
        newSelectedSlots.map(slot =>
          registerTimeslot(slot.v_id, slot.date, slot.timeslot)
        )
      );
    }
    setIsUpdating(true);
    registerAllSlots();
    setSelectedSlots(prev => [...prev, ...newSelectedSlots])
    setIsUpdating(false);
    toast.success("All new timeslots have been registered!")
    setNewSelectedSlots([]);
  }

  const handleSelectRegVolunteer = (vol: Volunteer) => {
    handleChangeFirstName(capitalize(vol.first_name));
    handleChangeLastName(capitalize(vol.last_name));
    setVolunteerName(`${capitalize(vol.first_name)} ${capitalize(vol.last_name)}`)
    retrieveVolunteer(vol.first_name, vol.last_name);
  }

  const obtainDateArr = (day: number, date: number, month: number, year: number): string[] => {
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

  const getWeekDateRange = (weekOffset: number = 0) => {
    const today = new Date();

    // Start of week: SUNDAY
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

    // End of week: SATURDAY
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    // Build the readable date range string
    const range = `${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Build the 7-day date array using your logic
    const dateArr = obtainDateArr(
      sunday.getDay(),        // 0 since it's Sunday (always)
      sunday.getDate(),
      sunday.getMonth() + 1,
      sunday.getFullYear()
    );

    return { range, dateArr };
  };


  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Volunteer Schedule</h1>
            <p className="text-sm text-muted-foreground">Click on time slots to add your availability</p>
          </div>

           <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset(weekOffset - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {getWeekDateRange(weekOffset).range}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset(weekOffset + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 justify-start">
              <div className="flex max-w-sm gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant={'outline'} size='icon'>
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Registered Users</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-sm min-w-3xs overflow-y-scroll">
                    {allRegisteredVolunteers.map((vol, id) => (
                        <DropdownMenuItem key={id} className="flex justify-between" onClick={() => handleSelectRegVolunteer(vol)}>
                          {capitalize(vol.first_name)} {capitalize(vol.last_name)}
                          <Badge variant="outline" className="text-xs">{capitalize(vol.role)}</Badge>
                        </DropdownMenuItem>
                    ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  id="volunteer-first-name"
                  type="text"
                  placeholder="Enter first name"
                  value={vFirstName}
                  onChange={(e) => handleChangeFirstName(e.target.value)}
                  className="max-w-[150px] px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <input
                  id="volunteer-last-name"
                  type="text"
                  placeholder="Enter last name"
                  value={vLastName}
                  onChange={(e) => handleChangeLastName(e.target.value)}
                  className="max-w-[150px] px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
              {vFirstName && vLastName &&(
                <Button onClick={handleFindVolunteer} size={'icon'} disabled={`${vFirstName} ${vLastName}`.toLowerCase() == volunteerName.toLowerCase()}>
                  <Search />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {vFirstName && vLastName && volunteerName && (
                <Badge variant="secondary" className="text-sm">
                  {getVolunteerStats(volunteerName).hours} hours selected
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
                : <Tooltip>
                    <TooltipTrigger>
                      <div 
                      className="cursor-pointer inline-block px-3 py-1 text-sm font-semibold text-red-100 bg-red-700 border border-red-800 rounded-full shadow-sm"
                      onClick={handleRegisterVolunteer}
                      >
                        Not Registered
                      </div> 
                    </TooltipTrigger>
                    <TooltipContent>
                      Click here to auto register volunteer!
                    </TooltipContent>
                  </Tooltip>
              )}
            </div>
          </div>
          {activeVolunteers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Volunteers</p>
                <div className="space-y-2">
                  {activeVolunteers.map((vCard) => (
                    <Collapsible
                      key={vCard.v_name}
                      open={vCard.isOpen}
                      onOpenChange={() => toggleVolunteerCard(vCard.v_name)}
                    >
                      <Card className="p-3">
                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">{vCard.v_name}</div>
                            <Badge variant="outline" className="text-xs">{capitalize(vCard.role)}</Badge>
                          </div>
                          {vCard.isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-[-10px] pt-3 border-t">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cumulative Hours:</span>
                              <span className="font-medium">{getVolunteerStats(vCard.v_name).hours} hours</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shifts This Week:</span>
                              <span className="font-medium">
                                {getVolunteerStats(vCard.v_name).shifts} shifts
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Role:</span>
                              <span className="font-medium">{capitalize(vCard.role)}</span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}
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
                    <div className="text-sm font-semibold text-foreground">{getWeekDateRange(weekOffset).dateArr[id]}</div>
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
                        isSelected={isSlotSelected(id, time)}
                        volunteers={getVolunteersForSlot(id, time)}
                        disabled={!volunteerName.trim()}
                        onClick={() => handleSlotClick(id, time)}
                      />
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
        {newSelectedSlots.length > 0 && (
            <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleRegisterTimeslots}
            disabled={isUpdating}>
                {isUpdating 
                ? <div role="status">
                    <svg aria-hidden="true" className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
                : 'Update Timesheet'
                }
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