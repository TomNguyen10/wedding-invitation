import { NextResponse } from "next/server";
import {
  fetchSheetData,
  updateSheetData,
  deleteRowFromSheet,
} from "../../lib/sheets";

const SHEET_ID = process.env.SHEET_ID;
const RANGE = "Sheet1!A:D";

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

export async function POST(request: Request) {
  const { rowIndex, values } = await request.json();

  try {
    await updateSheetData(
      SHEET_ID,
      `Sheet1!A${rowIndex + 1}:D${rowIndex + 1}`,
      values
    );
    return NextResponse.json({ message: "Update successful" });
  } catch (error) {
    console.error("Error updating sheet data:", error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { rowIndex } = await request.json();

  try {
    await deleteRowFromSheet(SHEET_ID, rowIndex);
    return NextResponse.json({ message: "Delete successful" });
  } catch (error) {
    console.error("Error deleting sheet data:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
