/**
 * Creasume waitlist → Google Sheet endpoint.
 *
 * Setup:
 *   1. Open your waitlist Google Sheet → Extensions → Apps Script.
 *   2. Replace the default code with this file's contents and Save.
 *   3. (Optional) put headers in row 1 of the sheet:
 *        Timestamp | Name | Email | Instagram
 *   4. Deploy → New deployment → type "Web app":
 *        - Execute as:      Me
 *        - Who has access:  Anyone
 *   5. Copy the Web app URL (ends in /exec) into VITE_SHEET_ENDPOINT in .env.
 *
 * The front end POSTs JSON { name, email, handle } as text/plain (no preflight),
 * so we parse e.postData.contents.
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];

    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.handle || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Lets you open the /exec URL in a browser to confirm the endpoint is live. */
function doGet() {
  return ContentService.createTextOutput('Creasume waitlist endpoint is live.');
}
