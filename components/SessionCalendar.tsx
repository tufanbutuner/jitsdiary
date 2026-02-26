"use client";

import { useState } from "react";
import {
  DayPicker,
  getDefaultClassNames,
  useDayPicker,
  type DayButton,
} from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface SessionCalendarProps {
  sessionDates: string[];
}

function toLocalDateKey(d: string) {
  return d.split("T")[0];
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CustomMonthCaption({ calendarMonth }: { calendarMonth: { date: Date } }) {
  const { goToMonth, previousMonth, nextMonth } = useDayPicker();

  const label = calendarMonth.date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <button
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        aria-label="Previous month"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 p-0 disabled:opacity-50"
        )}
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      <span className="text-sm font-medium select-none">{label}</span>
      <button
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        aria-label="Next month"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 p-0 disabled:opacity-50"
        )}
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  );
}

export default function SessionCalendar({ sessionDates }: SessionCalendarProps) {
  const today = new Date();
  const [month, setMonth] = useState<Date>(today);

  const countByDay = sessionDates.reduce<Record<string, number>>((acc, d) => {
    const key = toLocalDateKey(d);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const sessionDateObjects = Object.keys(countByDay).map((key) => {
    const [year, mon, day] = key.split("-").map(Number);
    return new Date(year, mon - 1, day);
  });

  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      mode="multiple"
      selected={sessionDateObjects}
      month={month}
      onMonthChange={setMonth}
      disabled={{ after: today }}
      showOutsideDays
      className="bg-background rounded-md border p-3 [--cell-size:--spacing(10)] w-full"
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn("flex flex-col w-full", defaultClassNames.months),
        month: cn("flex flex-col w-full", defaultClassNames.month),
        nav: "hidden",
        month_caption: "hidden",
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none text-center",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        day: cn(
          "relative w-full h-full p-0 text-center aspect-square select-none",
          defaultClassNames.day
        ),
        today: cn("bg-accent text-accent-foreground rounded-md", defaultClassNames.today),
        outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
      }}
      components={{
        MonthCaption: CustomMonthCaption as React.ComponentType<{ calendarMonth: { date: Date } }>,
        Nav: () => null,
        DayButton: ({ day, modifiers, className, ...props }: React.ComponentProps<typeof DayButton>) => {
          const count = countByDay[dateKey(day.date)];
          const isSelected = modifiers.selected;

          return (
            <button
              {...props}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col items-center justify-center gap-0.5 leading-none font-normal rounded-md",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                className
              )}
            >
              <span>{day.date.getDate()}</span>
              {count && (
                <span
                  className={cn(
                    "text-[9px] font-semibold leading-none",
                    isSelected ? "text-primary-foreground/80" : "text-primary"
                  )}
                >
                  {count}x
                </span>
              )}
            </button>
          );
        },
      }}
    />
  );
}
