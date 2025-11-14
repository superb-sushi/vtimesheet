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

    // Delete the timeslot record matching the criteria
    const deletedRecord = await prisma.timeslots.deleteMany({
      where: {
        v_id: v_id,
        date: adjustedDate,
        timeslot: timeslot,
      },
    });

    if (deletedRecord.count === 0) {
      return NextResponse.json(
        { message: "No matching timeslot found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Timeslot deleted", deletedRecord }, { status: 200 });
  } catch (err) {
    console.error("Error deleting timeslot:", err);
    return NextResponse.json(
      { error: "Failed to delete timeslot" },
      { status: 500 }
    );
  }
}
