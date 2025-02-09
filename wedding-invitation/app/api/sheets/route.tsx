import { NextResponse } from "next/server";
import {
  fetchSheetData,
  updateSheetData,
  deleteRowFromSheet,
  appendRowToSheet,
} from "../../lib/sheets";

const SHEET_ID = process.env.SHEET_ID!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get("sheet") || "Hanoi";
    const RANGE = `${sheetName}!A:G`;

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
  const { values, sheet } = await request.json();
  const sheetName = sheet || "Hanoi";

  try {
    await appendRowToSheet(SHEET_ID, sheetName, values);
    return NextResponse.json({ message: "Row added successfully!" });
  } catch (error) {
    console.error("Error updating sheet data:", error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { rowIndex, values, sheet } = await request.json();
  const sheetName = sheet || "Hanoi";

  try {
    await updateSheetData(SHEET_ID, sheetName, rowIndex, values);
    return NextResponse.json({ message: "Row updated successfully!" });
  } catch (error) {
    console.error("Error updating sheet data:", error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { rowIndex, sheet } = await request.json();
  const sheetName = sheet || "Hanoi";
  try {
    await deleteRowFromSheet(SHEET_ID, rowIndex, sheetName);
    return NextResponse.json({ message: "Delete successful" });
  } catch (error) {
    console.error("Error deleting sheet data:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
