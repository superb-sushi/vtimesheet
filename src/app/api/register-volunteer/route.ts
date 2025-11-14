import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, role } = body;

    if (!first_name || !last_name || !role) {
      return NextResponse.json(
        { error: "first_name, last_name and role are required" },
        { status: 400 }
      );
    }

    const volunteer = await prisma.volunteers.create({
      data: {
        first_name,
        last_name,
        role,
      },
    });

    return NextResponse.json(volunteer, { status: 201 });
  } catch (err) {
    console.error("Error creating volunteer:", err);
    return NextResponse.json(
      { error: "Failed to create volunteer" },
      { status: 500 }
    );
  }
}