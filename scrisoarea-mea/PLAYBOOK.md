export const DAILY_OPERATOR_CHECKLIST = `
# Daily Operator Checklist (15-20 min)

**Morning (09:30 - 10:00)**

1.  **Status Scan (Admin Panel)**
    *   **Donations (Stripe)**: Verify successful donations > 0. Check for failed/pending transactions that need attention.
    *   **Redirecționări (230/177)**: Scan new requests.
        *   Action: Briefly verify names and signatures look legitimate.
        *   Status: Leave as \`SUBMITTED\`. Only mark \`REJECTED\` if obviously spam.
    *   **Fulfillment Claims**: Check for new claims.
        *   Action: If claim looks valid (email/user known or looks legit), approve (if manual approval needed) or just monitor.
    *   **Proofs**: Check pending proofs from partners.
        *   Action: Review image content. If valid & respectful, mark \`PUBLISHED\`.

2.  **Inbox Triage**
    *   Scanning subject lines only.
    *   Urgent: "Greșeală date", "Eroare plată", "Anulare".
    *   Wait: General inquiries, partnerships, "Thank you" notes.

**Midday (13:00 - 13:30)**

1.  **Response Window**
    *   Reply to updated data requests (CNP/CUI fixes).
    *   Reply to urgent questions using *Templates*.
    *   *Rule*: Do not engage in long debates. Use standard replies.

2.  **Fulfillment Check**
    *   Has any claim expired (>48h without AWB)?
    *   Action: Send 1 reminder email manually if system hasn't.

**End of Day (17:30 - 17:45)**

1.  **Sanity Check**
    *   No pending critical errors in logs.
    *   Last check on validations (Partners adding letters).
2.  **Leave for Tomorrow**
    *   Non-urgent emails.
    *   Bulk SPV prep (save for Weekly slot).
`;

export const WEEKLY_OPERATOR_CHECKLIST = `
# Weekly Operator Checklist (Friday Recommended)

**Duration: 60-90 Minutes**

1.  **Tax Redirection Batching (Friday AM)**
    *   Go to \`/admin/redirectionari\`.
    *   Export CSV of new requests since last batch.
    *   Download PDFs for new requests (batch download if tool avail, or one-by-one/export generic).
    *   **Naming Convention**: \`YYYY-MM-DD_[TYPE]_[NAME]_[ID_SHORT].pdf\`
    *   Group into folder: \`Batch_Week_X_2026\`.

2.  **SPV Prep & Filing**
    *   Review batch for obvious errors.
    *   Sign XML/PDFs with Digital Certificate (External Tool).
    *   Submit to ANAF SPV.
    *   **Update Admin**: Mark filed requests as \`FILED\`.

3.  **Updates & Transparency**
    *   Post 1 **"Veste Bună"** on \`/update-uri\`:
        *   Example: "Am trimis X jucării săptămâna asta" or "Mulțumim pentru cei 3.5%".
    *   Check Partner Activity:
        *   Are they logging in?
        *   Adding letters?
        *   If inactive > 2 weeks, send "Salut, totul ok?" email.

4.  **Financial Reconciliation**
    *   Compare Stripe payout vs Bank Account.
    *   Flag discrepancies to Accountant.
`;

export const SPV_MINI_PROCEDURE = `
# SPV Filing Mini-Procedure

**Goal**: Batch file requests efficiently.

**Steps**:

1.  **Export**:
    *   Admin > Redirecționări.
    *   Filter: Status \`READY_FOR_ANAF\` (or \`SUBMITTED\` if you skip ready state).
    *   Export CSV.

2.  **Prepare Files**:
    *   **Local Folder**: \`C:\\Scrisoarea\\SPV\\2026\\Saptamana_XX\`
    *   Download generated PDF 230s into this folder.
    *   *If using bulk XML generator*: Import CSV into generator, output XML.

3.  **Signing**:
    *   Insert Token (DigiSign/CertSign).
    *   Open Signing App.
    *   Sign the PDF/XML batch.

4.  **Upload**:
    *   Log into [pfinternet.anaf.ro](https://pfinternet.anaf.ro).
    *   Upload signed file(s).
    *   **Save Recipisa**: Download the submission receipt immediately.
    *   Name Recipisa: \`Recipisa_Batch_Week_XX.pdf\`.

5.  **Confirm**:
    *   Verify Recipisa has no errors (index processing success).
    *   Go to Admin Panel.
    *   Select batched IDs.
    *   **Update Status**: \`FILED\`.
    *   Add Note: "Depus in Batch XX, Recipisa: [Local_Ref_ID]".

**Storage**:
*   Keep "Recipise" in a synced Google Drive/OneDrive folder for backup.
*   Never delete raw user PDFs until +5 years (legal req).
`;

export const REPLY_TEMPLATES = `
# Message & Email Reply Templates

**1. "Ați depus formularul meu?"**
> Salut,
> Da, formularul tău a fost preluat. Îl centralizăm și îl depunem la ANAF în următorul nostru lot programat (depunem săptămânal/lunar).
> Vei primi o confirmare finală pe email imediat ce avem recipisa de la ANAF.
> Mulțumim,
> Echipa Vise pe hârtie

**2. "Pot modifica datele?" / "Am greșit CNP/CUI"**
> Salut,
> Sigur. Te rugăm să ne răspunzi la acest email cu datele corecte.
> Vom actualiza noi cererea în sistem și vom regenera formularul înainte de depunere.
> Nu este nevoie să completezi din nou pe site.
> Mulțumim!

**3. "Nu mai vreau să redirecționez"**
> Salut,
> Am înțeles. Am anulat cererea ta din sistemul nostru și nu va fi trimisă către ANAF.
> Datele tale au fost șterse din lista de procesare.
> O zi bună!

**4. "Când apare impactul?" / "Unde sunt banii mei?"**
> Salut,
> Sumele din 3.5% sunt virate de stat către noi de obicei în termen de 90 de zile de la termenul limită de depunere (nu de la data completării).
> Imediat ce intră fondurile, le alocăm proiectelor și vei vedea actualizări pe pagina de Transparență.

**5. "Sunteți ONG real?"**
> Salut,
> Da, suntem Asociația Vise pe hârtie, CUI [RO...], înregistrată în Registrul Asociațiilor și Fundațiilor.
> Poți verifica rapoartele noastre direct pe site la secțiunea Transparență sau pe site-ul Ministerului Finanțelor.
> Suntem aici dacă ai alte întrebări.
`;

export const RED_FLAGS_STOP_RULES = `
# Red Flags & Stop Rules

**🛑 IMMEDIATE STOP (Critical)**
*   **Duplicate IPs**: >5 requests from same IP in <10 mins with different names (Sign of script/bot).
    *   *Action*: Block IP, Mark requests REJECTED.
*   **Sequential CNPs**: CNPs differing only by last digits.
    *   *Action*: Flag for review. Do not file.
*   **Malformed Signatures**: Signature is a straight line or dot constantly.
    *   *Action*: Contact donor to re-sign or REJECT.

**⚠️ MANUAL REVIEW**
*   **Large Amounts (177)**: Any sponsorship > 10,000 RON.
    *   *Action*: Personal verification call/email to company rep.
*   **Repeated Corrections**: Same user emails 3+ times to change data.
    *   *Action*: Verify it's really them (call if possible).

**⏸ WHEN TO PAUSE**
*   **Platform Error**: If PDFs generate blank/corrupt.
    *   *Action*: Disable form, put up "Maintenance" banner.
*   **Partner Misconduct**: Fake proofs or rude tone in letters.
    *   *Action*: Suspend Partner account immediately. Investigation.
`;

export const ROLES_DIVISION = `
# Ownership & Roles

**Operator A (Primary - "Front Desk")**
*   **Focus**: User interaction, Inbox, Validation.
*   **Tasks**:
    *   Daily status checks.
    *   Replying to emails (Templates).
    *   Validating Proofs & Letters.
    *   Approving Standard Fulfillment.

**Operator B (Technical/Legal - "Back Office")**
*   **Focus**: SPV, Finances, Platform Health.
*   **Tasks**:
    *   Weekly Batch Export & SPV Filing.
    *   Financial Reconciliation (Stripe vs Bank).
    *   Updating /transparenta.
    *   Partner Relationship (Onboarding/Agreements).
    *   Handling "Red Flag" technical cases.

**Backup Rule**:
*   Checklists are shared. If A is out, B does "Morning Scan".
*   If B is out, A pauses SPV filing until B returns (unless urgent deadline).
`;
