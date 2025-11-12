import { cn } from "@/lib/utils";

interface TimeSlotProps {
  current_day: number,
  day: string;
  time: string;
  isSelected: boolean;
  volunteers: string[];
  disabled?: boolean;
  onClick: () => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const VOLUNTEER_COLORS = [
  "hsl(210 60% 70%)",  // Soft Blue
  "hsl(340 50% 75%)",  // Soft Pink
  "hsl(280 50% 70%)",  // Soft Purple
  "hsl(160 50% 65%)",  // Soft Teal
  "hsl(30 60% 75%)",   // Soft Orange
  "hsl(145 50% 65%)",  // Soft Green
];

const getVolunteerColor = (volunteer: string) => {
  let hash = 0;
  for (let i = 0; i < volunteer.length; i++) {
    hash = volunteer.charCodeAt(i) + ((hash << 5) - hash);
  }
  return VOLUNTEER_COLORS[Math.abs(hash) % VOLUNTEER_COLORS.length];
};

const Timeslot = ({ current_day, day, time, isSelected, volunteers, disabled, onClick }: TimeSlotProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        `relative min-h-[80px] border-r border-b border-slot-border transition-colors ${current_day == DAYS.indexOf(day) ? "bg-zinc-100" : "" }`,
        "hover:bg-stone-100",
        disabled && "cursor-not-allowed opacity-60",
        !disabled && "cursor-pointer"
      )}
    >
      <div className="h-full space-y-1">
        {volunteers.map((volunteer, idx) => (
          <div
            key={idx}
            className={cn(
              "text-xs px-2 py-1 rounded text-white flex justify-center items-center font-medium truncate transition-all h-full",
              isSelected && ""
            )}
            style={{ backgroundColor: getVolunteerColor(volunteer) }}
          >
            {volunteer}
          </div>
        ))}
      </div>
    </button>
  );
};

export default Timeslot;