"use client";

import { useState } from "react";
import SessionCalendar from "@/components/SessionCalendar";
import NewSessionModal from "@/components/modals/NewSessionModal";
import type { Gym } from "@/types/index";

interface Props {
  sessionDates: string[];
  gyms: Gym[];
  defaultGymId: string;
}

export default function CalendarWithModal({ sessionDates, gyms, defaultGymId }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  function handleDateClick(date: string) {
    setSelectedDate(date);
    setModalOpen(true);
  }

  return (
    <>
      <SessionCalendar sessionDates={sessionDates} onDateClick={handleDateClick} />
      <NewSessionModal
        gyms={gyms}
        defaultGymId={defaultGymId}
        initialDate={selectedDate}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
