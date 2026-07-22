import { NextResponse } from 'next/server';
import { seedDummyData } from '@/lib/actions/seed';

export async function GET() {
  try {
    const result = await seedDummyData();
    return NextResponse.json({ message: "Seeding successful!", data: result });
  } catch (error) {
    console.error("Seeding failed:", error);
    return NextResponse.json(
      { error: "Seeding failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
