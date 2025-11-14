import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const timeslots = await prisma.timeslots.findMany({
      include: {
        volunteers: {
          select: {
            first_name: true,
            last_name: true,
            role: true,
          }
        }
      },
      orderBy: [
        { date: "asc" },
        { timeslot: "asc" },
      ],
    });

    function capitalize(str: string) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }


    // Transform each entry to include full_name
    const mapped = timeslots.map(t => ({
      v_id: t.v_id,
      date: t.date,
      timeslot: t.timeslot,
      v_name: `${capitalize(t.volunteers.first_name)} ${capitalize(t.volunteers.last_name)}`,
      role: t.volunteers.role,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (err) {
    console.error("Error fetching timeslots:", err);
    return NextResponse.json(
      { error: "Failed to fetch timeslots" },
      { status: 500 }
    );
  }
}