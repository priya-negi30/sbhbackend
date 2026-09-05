const nodemailer = require('nodemailer');

/**
 * Gmail SMTP transporter.
 *
 * Required env vars:
 *   GMAIL_USER          - the Gmail address to send FROM (e.g. notifications@yourdomain.com or a gmail.com address)
 *   GMAIL_APP_PASSWORD  - a 16-character Google "App Password" (NOT your normal Gmail password).
 *                         Create one at https://myaccount.google.com/apppasswords
 *                         (requires 2-Step Verification to be enabled on the account).
 *   HR_EMAIL            - the primary "To" address for career-application notifications
 *                         (defaults to dme@sbhhospital.com if not set).
 *   HR_CC_EMAILS        - optional comma-separated list of additional addresses to CC,
 *                         e.g. "hr2@sbhhospital.com,manager@sbhhospital.com"
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      'Email is not configured: set GMAIL_USER and GMAIL_APP_PASSWORD in your environment. ' +
        'See .env.example for details on generating a Gmail App Password.'
    );
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter;
}

/**
 * Sends the HR notification email for a new job application.
 * @param {Object} params
 * @param {Object} params.application - The created JobApplication instance (plain object).
 * @param {string} params.resumeUrl - Public Vercel Blob URL of the uploaded resume.
 * @param {string|string[]} [params.cc] - Optional extra CC recipient(s) for this specific email,
 *                                        on top of whatever HR_CC_EMAILS defines. Accepts an
 *                                        array of addresses or a comma-separated string.
 */
async function sendJobApplicationEmail({ application, resumeUrl, cc }) {
  const toEmail = process.env.HR_EMAIL || 'dme@sbhhospital.com';
  const fromEmail = process.env.GMAIL_USER;

  // Merge the default CC list (from env) with any extra CC addresses passed in for this call.
  const envCc = (process.env.HR_CC_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  const extraCc = Array.isArray(cc)
    ? cc.map((e) => e.trim()).filter(Boolean)
    : (cc || '').split(',').map((e) => e.trim()).filter(Boolean);
  const ccList = [...new Set([...envCc, ...extraCc])];

  const rows = [
    ['Job Title', application.job_title],
    ['Applicant Name', application.fname],
    ['Gender', application.gender],
    ['Email', application.email],
    ['Contact No', application.contact_no],
    ['Current Location', application.current_location],
    ['Address', application.address],
    ['Current Company', application.current_company],
    ['Current Designation', application.current_designation],
    ['Current CTC', application.current_ctc],
    ['Marital Status', application.marital_status],
    ['Qualification', application.qualification],
    ['Notice Period', application.notice_period],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;border:1px solid #e5e7eb;">${label}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${value}</td></tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;">
      <h2 style="color:#0f172a;">New Job Application Received</h2>
      <p>A new candidate has applied via the SBH Hospital careers page.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        ${rows}
      </table>
      <p>
        <a href="${resumeUrl}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">
          Download Resume
        </a>
      </p>
      <p style="color:#64748b;font-size:12px;">This is an automated notification from the SBH Hospital admin system.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: `"SBH Hospital Careers" <${fromEmail}>`,
    to: toEmail,
    ...(ccList.length ? { cc: ccList.join(', ') } : {}),
    subject: `New Application: ${application.job_title || 'Job Opening'} - ${application.fname}`,
    html,
  });
}

module.exports = { sendJobApplicationEmail, getTransporter };