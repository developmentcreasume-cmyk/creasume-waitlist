/**
 * Creasume waitlist → Google Sheet endpoint + welcome-email automation.
 *
 * Sheet column layout (this project writes and reads these positions):
 *   A: Timestamp | B: Name | C: Email | D: Instagram | E: Send? (checkbox)
 *   F: Phone | G: Followers | H: Posts
 *
 * ─── doPost / doGet setup ───
 *   1. Open your waitlist Google Sheet → Extensions → Apps Script.
 *   2. Paste this whole file in (replacing the default code) and Save.
 *   3. Deploy → New deployment → type "Web app":
 *        - Execute as:      Me
 *        - Who has access:  Anyone
 *   4. Copy the Web app URL (ends in /exec) into VITE_SHEET_ENDPOINT in .env.
 *
 * The front end POSTs JSON { name, email, phone, handle, followers, posts }
 * as text/plain (no preflight), so we parse e.postData.contents.
 *
 * ─── sendEmails setup ───
 *   Requires an HTML file in this same Apps Script project named
 *   "CreasumeWaitlistEmail" (+ → HTML file) with the welcome email markup.
 *   Run sendEmails manually, or add a time-driven trigger (Triggers → Add
 *   trigger) to run it periodically. It emails every row whose column E
 *   checkbox is checked, then unchecks it so it isn't emailed twice.
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Waitlist response') || ss.getSheetByName('Sheet1') || ss.getSheets()[0];

    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.handle || '',
      false,
      data.phone || '',
      data.followers || '',
      data.posts || '',
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

function sendEmails() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Waitlist response"); // adjust sheet name
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const email = data[i][2];
    const name = data[i][1];
    const checkbox = data[i][4];

    if (checkbox === true) {
      // Pick email template depending on accommodation
      templateFile = "CreasumeWaitlistEmail";
      // Load template and inject variables
      const t = HtmlService.createTemplateFromFile(templateFile);
      t.NAME = name;

      const htmlBody = t.evaluate().getContent();
      const textFallback = `Hello ${name},\n\nThank you for joining the waitlist. We will get back to you as soon as possible.\n\nRegards,\nTeam Creasume`;

      GmailApp.sendEmail(email,
        "You're in! What's next?",
        textFallback,
        { htmlBody: htmlBody,
      name: "Creasume" });


      sheet.getRange(i + 1, 5).setValue(false); // Col E
    }
  }
}
