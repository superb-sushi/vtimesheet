import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  console.log("Received request URL:", request.url);
  const { searchParams } = new URL(request.url);
  const first = searchParams.get("first");
  const last = searchParams.get("last");
  const volunteers = await prisma.volunteers.findMany({
      where: {
        first_name: first!,
        last_name: last!,
      },
    });
    console.log("Retrieved volunteers:", volunteers);
return NextResponse.json(volunteers);
}