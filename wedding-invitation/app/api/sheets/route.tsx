import { NextResponse } from "next/server";
import { fetchSheetData } from "../../lib/sheets";

const SHEET_ID = process.env.SHEET_ID;
const RANGE = "Sheet1!A2:D";

export async function GET() {
  try {
    const data = await fetchSheetData(SHEET_ID, RANGE);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
