import { google, sheets_v4 as sheetsTypes } from "googleapis";

const sheets = google.sheets("v4");

export const getAuth = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(
        /\\n/g,
        "\n"
      ),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return await auth.getClient();
};

export const fetchSheetData = async (spreadsheetId: string, range: string) => {
  const auth = await getAuth();

  const response = await sheets.spreadsheets.values.get({
    auth: auth as any,
    spreadsheetId,
    range,
  });

  return response.data.values;
};

export const updateSheetData = async (
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  values: any[]
) => {
  const auth = await getAuth();
  const columnRange = `A${rowIndex + 1}:G${rowIndex + 1}`;
  const fullRange = `${sheetName}!${columnRange}`;

  const response = await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: fullRange,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  } as sheetsTypes.Params$Resource$Spreadsheets$Values$Update);

  return response.data;
};

export const getSheetId = async (spreadsheetId: string, sheetName: string) => {
  const auth = await getAuth();
  const response = await sheets.spreadsheets.get({
    auth: auth as sheetsTypes.Params$Resource$Spreadsheets$Get["auth"],
    spreadsheetId,
  });

  const sheet = response.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );

  if (sheet && sheet.properties?.sheetId !== undefined) {
    return sheet.properties.sheetId;
  }
  throw new Error(`Sheet ID not found for sheet: ${sheetName}`);
};

export const deleteRowFromSheet = async (
  spreadsheetId: string,
  rowIndex: number,
  sheetName: string
) => {
  const auth = await getAuth();
  const sheetId = await getSheetId(spreadsheetId, sheetName);

  const sheetsApi = google.sheets({ version: "v4", auth: auth as any });

  const requestBody = {
    requests: [
      {
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: "ROWS",
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      },
    ],
  };

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody,
  });
};

export const appendRowToSheet = async (
  spreadsheetId: string,
  sheetName: string,
  values: any[]
) => {
  const auth = await getAuth();

  const range = `${sheetName}!A:D`;

  const response = await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  } as sheetsTypes.Params$Resource$Spreadsheets$Values$Append);

  return response.data;
};
