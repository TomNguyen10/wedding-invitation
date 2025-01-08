import { google } from "googleapis";

const sheets = google.sheets("v4");

export const getAuth = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
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
