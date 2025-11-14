import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { v_id, date, timeslot } = body;

    if (!v_id || !date || !timeslot) {
      return NextResponse.json(
        { error: "v_id, date and timeslot are required" },
        { status: 400 }
      );
    }

    const originalDate = new Date(date);
    const adjustedDate = new Date(originalDate);
    adjustedDate.setDate(adjustedDate.getDate() + 1);

    const timeslotRecord = await prisma.timeslots.create({
      data: {
        v_id: v_id,
        date: adjustedDate,
        timeslot: timeslot,
      },
    });

    return NextResponse.json(timeslotRecord, { status: 201 });
  } catch (err) {
    console.error("Error creating timeslot:", err);
    return NextResponse.json(
      { error: "Failed to create timeslot" },
      { status: 500 }
    );
  }
}