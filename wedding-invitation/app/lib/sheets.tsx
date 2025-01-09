import { google } from "googleapis";

const sheets = google.sheets("v4");

export const getAuth = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return await auth.getClient();
};

export const fetchSheetData = async (spreadsheetId: string, range: string) => {
  const auth = await getAuth();

  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  return response.data.values;
};

export const updateSheetData = async (
  spreadsheetId: string,
  range: string,
  values: any[]
) => {
  const auth = await getAuth();

  const response = await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [values],
    },
  });

  return response.data;
};

export const getSheetId = async (spreadsheetId: string) => {
  const auth = await getAuth();
  const response = await sheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  return response.data.sheets[0].properties.sheetId;
};

export const deleteRowFromSheet = async (
  spreadsheetId: string,
  rowIndex: number
) => {
  const auth = await getAuth();

  const sheetId = await getSheetId(spreadsheetId);

  const sheetsApi = google.sheets({ version: "v4", auth });

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
    resource: requestBody,
  });
};
